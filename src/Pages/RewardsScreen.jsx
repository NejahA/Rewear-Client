// NEW: RewardsScreen.jsx - DAILY CLAIM + FULL REWARDS VIEW
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MoonLoader } from "react-spinners";

const RewardsScreen = () => {
  const [rewards, setRewards] = useState({
    points: 0,
    level: 1,
    exp: 0,
    nextLevelIn: 500,
    streak: 0,
    referralCode: "",
    referrals: 0,
    badges: [],
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/reward/me`, {
        withCredentials: true,
      });
      setRewards(res.data);
    } catch (err) {
      console.error("Error fetching rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  const claimDaily = async () => {
    setClaimLoading(true);
    setClaimResult(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_VERCEL_URI}/api/reward/daily`, {}, {
        withCredentials: true,
      });
      setClaimResult(res.data);
      fetchRewards(); // Refresh rewards after claim
    } catch (err) {
      console.error("Daily claim error:", err);
      setClaimResult({ claimed: false, message: err.response?.data?.message || "Error claiming daily reward" });
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <MoonLoader size={60} color="#8356C0" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Your Rewards</h2>

      {/* Points & Level */}
      <div className="card mb-4">
        <div className="card-body text-center">
          <h4>Level {rewards.level}</h4>
          <div className="progress mb-2" style={{ height: "20px" }}>
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${(rewards.exp / 500) * 100}%`, backgroundColor: "#8356C0" }}
            >
              {rewards.exp} / 500
            </div>
          </div>
          <p>Points: {rewards.points} | Next level in: {rewards.nextLevelIn} exp</p>
        </div>
      </div>

      {/* Streak & Daily Claim */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3">Daily Streak: {rewards.streak} days</h5>
          <button 
            className="btn btn-primary w-100" 
            onClick={claimDaily}
            disabled={claimLoading}
            style={{ backgroundColor: "#8356C0" }}
          >
            {claimLoading ? (
              <MoonLoader size={20} color="#fff" />
            ) : (
              "Claim Daily Reward"
            )}
          </button>
          {claimResult && (
            <div className={`alert mt-3 ${claimResult.claimed ? 'alert-success' : 'alert-warning'}`}>
              {claimResult.message}
              {claimResult.claimed && (
                <p>+{claimResult.totalToday} points (base: {claimResult.basePoints} + streak bonus: {claimResult.streakBonus})</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Referrals */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Referrals: {rewards.referrals}</h5>
          <p>Your Code: {rewards.referralCode}</p>
          <button 
            className="btn btn-outline-primary w-100"
            onClick={() => navigator.clipboard.writeText(rewards.referralCode)}
          >
            Copy Referral Code
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Badges ({rewards.badges.length})</h5>
          {rewards.badges.length > 0 ? (
            <div className="row">
              {rewards.badges.map((badge) => (
                <div key={badge._id} className="col-4 col-md-3 text-center mb-3">
                  <i className={`${badge.icon} fs-1 text-${badge.rarity === 'legendary' ? 'warning' : badge.rarity === 'epic' ? 'purple' : badge.rarity === 'rare' ? 'primary' : 'secondary'}`}></i>
                  <div className="small text-truncate">{badge.name}</div>
                  <small className="text-muted text-capitalize">{badge.rarity}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No badges yet - keep earning!</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-body">
          <h5>Recent Activity</h5>
          {rewards.recent.length > 0 ? (
            <ul className="list-group">
              {rewards.recent.map((log, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between">
                  <div>
                    {log.action.replace('_', ' ').toUpperCase()}
                    <small className="text-muted ms-2">{new Date(log.createdAt).toLocaleString()}</small>
                  </div>
                  <span className="badge bg-success">+{log.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsScreen;