import React from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import { ServerUrl } from "../App";
import AuthModel from "./AuthModel";

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + '/api/auth/logout', {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate('/');
    } 
    catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-6xl items-center justify-between rounded-3xl border border-gray-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex cursor-pointer items-center gap-3">
          <div className="rounded-lg bg-black p-2 text-white">
            <BsRobot size={18} />
          </div>
          <h1 className="hidden text-lg font-semibold md:block">InterviewIQ.AI</h1>
        </div>

        <div className="relative flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-md transition hover:bg-gray-200">
              <BsCoin size={18} />
              {userData?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className="absolute -right-20 top-12 z-50 w-64 rounded border border-gray-200 bg-white p-5 shadow-xl">
                <p className="mb-4 text-sm text-gray-600">
                  Need more credits to continue interviews
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full rounded-lg bg-black py-2 text-sm text-white"
                >
                  Buy More Credits
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black font-semibold text-white"
            >
              {userData ? (
                userData?.name.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={18} />
              )}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-1 text-md font-medium text-blue-500">
                  {userData?.name}
                </p>

                <button
                  onClick={() => navigate('/history')}
                  className="w-full py-2 text-left text-sm text-gray-600 hover:text-black"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 py-2 text-left text-sm text-red-500"
                >
                  <HiOutlineLogout size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;