import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import {askAI} from '../services/openRouter.service.js';
import User from '../models/user.model.js'
import Interview from '../models/interview.model.js';

export const analyzeResume=async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({message:"Resume file is required"});
        }
        const filePath=req.file.path;

        const fileBuffer=await fs.promises.readFile(filePath);
        const uint8Array=new Uint8Array(fileBuffer);

        const pdf=await pdfjsLib.getDocument({data:uint8Array}).promise;

        let resumeText="";

        for(let pageNum=1; pageNum<=pdf.numPages; pageNum++){
            const page=await pdf.getPage(pageNum);
            const content=await page.getTextContent();

            const pageText=content.items.map(item=>item.str).join(" ");
            resumeText+=pageText+"\n";
        }

        resumeText=resumeText.replace(/\s+/g," ").trim();

        const messages=[
            {
                role:"system",
                content:`
                Extract structured data from resume.
                Return strictly JSON. No explanation. No text. No markdown.
                Format:
                {
                    "role":"string",
                    "experience":"string",
                    "projects":["project1","project2"],
                    "skills":["skill1","skill2"]
                }`
            },
            {
                role:"user",
                content:resumeText
            }
        ];
        const aiResponse=await askAI(messages);

        let cleanResponse=aiResponse.trim();
        cleanResponse=cleanResponse.replace(/```json/g,"").replace(/```/g,"");
        const jsonMatch=cleanResponse.match(/\{[\s\S]*\}/);

        if(!jsonMatch){
            throw new Error("No valid JSON found in AI response");
        }

        const parsed=JSON.parse(jsonMatch[0]);

        fs.unlinkSync(filePath);

        res.json({
            role:parsed.role,
            experience:parsed.experience,
            projects:parsed.projects,
            skills:parsed.skills,
            resumeText
        });

    }
    catch(error){
        console.error(error);

        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({message:error.message});
    }
};


export const generateQuestions=async(req,res)=>{
    try{
        let {role, experience, mode, resumeText, projects, skills}=req.body;

        role=role?.trim() || "B.Tech Student";
        experience=experience?.trim();
        mode=mode?.trim() || "Technical";

        if(!experience || experience.length<5){
            experience="No professional experience. Fresh graduate or student.";
        }

        if(!role || !experience || !mode){
            console.log("Missing fields:", {role, experience, mode});
            return res.status(400).json({message:"Role, experience and mode are required"});
        }

        const user=await User.findById(req.userId);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(user.credits<50){
            console.log("Insufficient credits for user:", user._id, "Credits:", user.credits);
            return res.status(400).json({message:"Not enough credits. Minimum 50 credits required."});
        }

        const projectText=Array.isArray(projects) && projects.length > 0 ? projects.join(","):"None";

        const skillText=Array.isArray(skills) && skills.length > 0 ? skills.join(","):"None";

        const safeResume=resumeText?.trim() || "None";

        const userPrompt=`
        Role:${role}
        Experience:${experience}
        InterviewMode:${mode}
        Projects:${projectText}
        Skills:${skillText}
        Resume:${safeResume}
        `;

        if(!userPrompt.trim()){
            console.log("Empty user prompt generated:", {userPrompt});
            return res.status(400).json({message:"Insufficient data to generate question"});
        }

        const messages=[
            {
                role:"system",
                content:`
                You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.
-2 Questions should be situation based questions to check candidate's problem solving and analytical skills and presence of mind.

Difficulty progression:
Question 1 → easy  
Question 2 → medium
Question 3 → medium  
Question 4 → hard  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];
    
    const aiResponse=await askAI(messages);
      if(!aiResponse || !aiResponse.trim()){
        return res.status(500).json({message:"AI failed to generate questions. Please try again."});
      }

    const questionsArray=aiResponse.split("\n").map(q=>q.trim()).filter(q=>q.length>0).slice(0,5);

    if(questionsArray.length===0){
        return res.status(500).json({message:"AI failed to generate valid questions. Please try again."});
    }

    user.credits-=50;
    await user.save();

    const interview=await Interview.create({
        userId:user._id,
        role,
        experience,
        mode,
        resumeText:safeResume,
        questions:questionsArray.map((q, index)=>({
            question:q,
            difficulty:["easy","medium","medium","hard","hard"][index],
            timeLeft:[60,90,90,120,120][index],
        }))
    });
    res.json({
        interviewId:interview._id,
        creditsLeft:user.credits,
        userName:user.name,
        questions:interview.questions
    });

}
catch(error){
    return res.status(500).json({message:`failed to create interview: ${error}`});
   }
}


export const submitAnswer=async(req,res)=>{
    try{
        const {interviewId, questionIndex, answer, timeTaken}=req.body;

        const interview=await Interview.findById(interviewId);
        const question=interview.questions[questionIndex];

        if(!answer){
            question.score=0;
            question.feedback="You did not provide an answer.";
            question.answer="";

            await interview.save();

            return res.json({feedback:question.feedback});
        }

        if(timeTaken>question.timeLimit){
            question.score=0;
            question.feedback="Time limit exceeded. Answer not evaluated.";
            question.answer=answer;

            await interview.save();

            return res.json({feedback:question.feedback});
        }

        const messages = [
            { 
               role: "system", 
               content: `You are a professional human interviewer evaluating a candidate's answer in a real interview.
               Evaluate naturally and fairly, like a real person would.Score the answer in these areas (0 to 10):
               1. Confidence – Does the answer sound clear, confident, and well-presented?
               2. Communication – Is the language simple, clear, and easy to understand?
               3. Correctness – Is the answer accurate, relevant, and complete?
               
               Rules:
               - Be realistic and unbiased.
               - Do not give random high scores.
               - If the answer is weak, score low.
               - If the answer is strong and detailed, score high.
               - Consider clarity, structure, and relevance.

               Calculate: 
               finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

               Feedback Rules:
               - Write natural human feedback.
               - 10 to 15 words only.
               - Sound like real interview feedback.
               - Can suggest improvement if needed.
               - Do NOT repeat the question.
               - Do NOT explain scoring.
               - Keep tone professional and honest.

               Return ONLY valid JSON in this format:
               { "confidence": number, 
                "communication": number, 
                "correctness": number, 
                "finalScore": number, 
                "feedback": "short human feedback" 
                }` 
            },

            { role: "user", content: `Question: ${question.question}Answer: ${answer}`} 
        ];

        const aiResponse=await askAI(messages);

        const parsed=JSON.parse(aiResponse);

        question.answer=answer;
        question.confidence=parsed.confidence;
        question.communication=parsed.communication;
        question.correctness=parsed.correctness;
        question.score=parsed.finalScore;
        question.feedback=parsed.feedback;

        await interview.save();

        return res.status(200).json({feedback:parsed.feedback});
    }
    catch(error){
        return res.status(500).json({message:`failed to submit answer: ${error}`});
    }
}    


export const finishInterview=async(req,res)=>{
    try{
        const {interviewId}=req.body;
        const interview=await Interview.findById(interviewId);
        if(!interview){
            return res.status(404).json({message:"Failed to find Interview"});
        }

        const totalQuestions=interview.questions.length;

        let totalScore=0;
        let totalConfidence=0;
        let totalCommunication=0;
        let totalCorrectness=0;

        interview.questions.forEach(q=>{
            totalScore+=q.score || 0;
            totalConfidence+=q.confidence || 0;
            totalCommunication+=q.communication || 0;
            totalCorrectness+=q.correctness || 0;
        });

        const finalScore=totalQuestions ? totalScore/totalQuestions : 0;
        const avgConfidence=totalQuestions ? totalConfidence/totalQuestions : 0;
        const avgCommunication=totalQuestions ? totalCommunication/totalQuestions : 0;
        const avgCorrectness=totalQuestions ? totalCorrectness/totalQuestions : 0;

        interview.finalScore=finalScore;
        interview.status="Completed";

        await interview.save();

        return res.status(200).json({
            finalScore:Number(finalScore.toFixed(1)),
            confidence:Number(avgConfidence.toFixed(1)),
            communication:Number(avgCommunication.toFixed(1)),
            correctness:Number(avgCorrectness.toFixed(1)),
            questionWiseScore:interview.questions.map(q=>({
                question:q.question,
                score:q.score || 0,
                feedback:q.feedback || "",
                confidence:q.confidence || 0,
                communication:q.communication || 0,
                correctness:q.correctness || 0,
            }))
        });
    }
    catch(error){
        return res.status(500).json({message:`failed to finish interview: ${error}`});
    }
}


export const getMyInterviews=async(req,res)=>{
    try{
        const interview =await Interview.find({userId:req.userId})
        .sort({createdAt:-1})
        .select("role experience mode finalScore status createdAt");

        return res.status(200).json(interview)
    }
    catch(error){
        return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
    }
}


export const getInterviewReport=async(req,res)=>{
    try{
        const interview=await Interview.findById(req.params.id)
        if(!interview){
            return res.status(404).json({message:"Interview not found"});
        }

        const totalQuestions=interview.questions.length;

        let totalConfidence=0;
        let totalCommunication=0;
        let totalCorrectness=0;

        interview.questions.forEach(q=>{
            totalConfidence+=q.confidence || 0;
            totalCommunication+=q.communication || 0;
            totalCorrectness+=q.correctness || 0;
        });

        const avgConfidence=totalQuestions ? totalConfidence/totalQuestions : 0;
        const avgCommunication=totalQuestions ? totalCommunication/totalQuestions : 0;
        const avgCorrectness=totalQuestions ? totalCorrectness/totalQuestions : 0;

        return res.json({
            finalScore:interview.finalScore,
            confidence:Number(avgConfidence.toFixed(1)),
            communication:Number(avgCommunication.toFixed(1)),
            correctness:Number(avgCorrectness.toFixed(1)),
            questionWiseScore:interview.questions
        });

    }
    catch(error){
        return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
    }
}