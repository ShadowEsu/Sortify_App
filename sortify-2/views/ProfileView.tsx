
import React, { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Zap, Trophy, Flame, CheckCircle2, Clock, Calendar, History, Shield, Fingerprint, RefreshCcw, Activity, Trash2, Recycle, Leaf, Info } from 'lucide-react';
import { dbService } from '../services/dbService';
import { soundService } from '../services/soundService';
import { UserStats, Mission, ScanRecord, BinCategory } from '../types';

const AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alpha',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bravo',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Delta',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Echo',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Foxtrot',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Golf',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hotel',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=India',
];

const ProfileView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  useEffect(() => {
    dbService.getCurrentSessionUser().then(u => {
      setUser(u);
      if (u) {
        setSelectedAvatar(u.photoURL);
        dbService.getScans(u.uid).then(setHistory);
      }
    });
  }, []);

  const saveIdentity = async () => {
    if (!selectedAvatar) return;
    soundService.playSuccess();
    const updated = await dbService.updateUser({ photoURL: selectedAvatar });
    setUser(updated);
    setIsCalibrating(false);
  };

  const startCalibration = () => {
    soundService.playClick();
    setIsCalibrating(true);
  };

  if (!user) return <div className="h-screen flex items-center justify-center text-emerald-500 font-black">RETRIEVING_DOSSIER...</div>;

  const dailies = user.missions.filter(m => !m.isWeekly);
  const weeklies = user.missions.filter(m => m.isWeekly);

  const getCategoryIcon = (cat: BinCategory) => {
    switch (cat) {
      case BinCategory.RECYCLE: return <Recycle size={14} className="text-blue-400" />;
      case BinCategory.COMPOST: return <Leaf size={14} className="text-emerald-400" />;
      default: return <Trash2 size={14} className="text-neutral-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 pb-32 font-gaming">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" /> OPERATIVE_ID
          </h2>
          <button onClick={() => {soundService.playClick(); onLogout();}} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
            <LogOut size={20} />
          </button>
        </div>

        {/* CHARACTER DISPLAY SECTION */}
        <div className="relative glass rounded-[3rem] p-8 border border-white/5 mb-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: user.gear.baseColor }} />
          
          <div className="flex flex-col items-center relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl rounded-full opacity-40 animate-pulse" style={{ backgroundColor: user.gear.baseColor }} />
              <img src={user.photoURL} className="relative w-36 h-36 rounded-[2.5rem] border-4 border-neutral-900 shadow-2xl bg-neutral-900 object-cover" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-1.5 rounded-2xl font-black text-[11px] uppercase shadow-[0_10px_20px_rgba(16,185,129,0.3)]">
                  {user.rankTier} {user.rankDivision}
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{user.displayName}</h3>
            <div className="flex flex-col items-center gap-2 mb-6">
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">ACTIVE PERK:</span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{user.gear.specialization}</span>
               </div>
            </div>

            <button 
              onClick={startCalibration}
              className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <RefreshCcw size={14} /> SYNC BIOMETRIC AVATAR
            </button>
          </div>
        </div>

        {/* PROGRESS CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-neutral-900/60 p-5 rounded-[2rem] border border-white/5">
              <Zap size={20} className="text-emerald-500 mb-3" />
              <p className="text-[14px] font-black text-white uppercase tabular-nums">{user.points.toLocaleString()}</p>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">TOTAL XP</p>
           </div>
           <div className="bg-neutral-900/60 p-5 rounded-[2rem] border border-white/5">
              <Flame size={20} className="text-orange-500 mb-3" />
              <p className="text-[14px] font-black text-white uppercase tabular-nums">{user.streak} DAYS</p>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">ACTIVE STREAK</p>
           </div>
        </div>

        {/* RANKED STATUS SECTION (Renamed from Tactical Accolades) */}
        <div className="mb-10">
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" /> RANKED PROGRESS
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {user.achievements.map(a => {
              const unlocked = !!a.unlockedAt;
              return (
                <div key={a.id} className={`p-4 rounded-3xl border transition-all flex items-center gap-3 ${unlocked ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-neutral-900 border-white/5 opacity-40 grayscale'}`}>
                  <div className="text-2xl">{a.icon}</div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase">{a.title}</h5>
                    <p className="text-[8px] font-bold text-neutral-500 uppercase">{a.requirement} SCANS</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MISSIONS HUB */}
        <div className="space-y-8 mb-10">
            <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" /> DAILY SORTIES
                </h4>
                <div className="space-y-3">
                    {dailies.map(m => (
                        <div key={m.id} className="bg-neutral-900/60 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-neutral-300 uppercase">{m.title}</span>
                                <span className="text-[10px] font-black text-emerald-500">+{m.xpReward} XP</span>
                            </div>
                            <div className="h-2 bg-black rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(m.current/m.target)*100}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-neutral-600 uppercase">
                                <span>{m.current} / {m.target} UNITS</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* DEPLOYMENT HISTORY SECTION (Added under Profile) */}
        <div className="mb-10">
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <History size={16} className="text-emerald-500" /> DEPLOYMENT LOGS
          </h4>
          
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">NO DEPLOYMENT DATA DETECTED</p>
              </div>
            ) : (
              history.slice(0, 10).map((scan) => (
                <div key={scan.id} className="bg-neutral-900/80 p-5 rounded-[2rem] border border-white/5 flex gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="relative shrink-0">
                    <img src={scan.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black font-black text-[8px] px-2 py-0.5 rounded-lg">
                      +{scan.xpAwarded}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-[12px] font-black text-white uppercase truncate">{scan.result.detectedItem}</h5>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {getCategoryIcon(scan.result.binCategory)}
                        <span className="text-[8px] font-black text-neutral-500 uppercase">{scan.result.binCategory}</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 mb-2">
                      <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2 italic">
                        "{scan.result.explanation}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                       <Info size={10} className="text-emerald-500/60" />
                       <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">
                         DISPOSAL: {scan.result.disposalTips[0] || 'STANDARD PROTOCOL'}
                       </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {history.length > 10 && (
               <div className="text-center">
                  <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">ONLY SHOWING RECENT SENSORS</p>
               </div>
            )}
          </div>
        </div>

        {/* AVATAR SELECTOR MODAL */}
        {isCalibrating && (
           <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
              <div className="w-full max-w-sm glass rounded-[3rem] p-8 border border-white/10 relative">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Fingerprint className="text-emerald-500" /> IDENTITY_SYNC
                 </h2>
                 
                 <div className="grid grid-cols-3 gap-3 mb-10">
                    {AVATARS.map((avatar, idx) => (
                       <button 
                          key={idx} 
                          onClick={() => {soundService.playClick(); setSelectedAvatar(avatar);}}
                          className={`relative aspect-square rounded-2xl border-2 transition-all overflow-hidden ${selectedAvatar === avatar ? 'border-emerald-500 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-white/5 grayscale opacity-40'}`}
                       >
                          <img src={avatar} className="w-full h-full object-cover" />
                          {selectedAvatar === avatar && (
                            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                               <CheckCircle2 size={24} className="text-emerald-500" />
                            </div>
                          )}
                       </button>
                    ))}
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => {soundService.playClick(); setIsCalibrating(false);}} className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black text-neutral-500 uppercase">ABORT</button>
                    <button onClick={saveIdentity} className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black text-[10px] font-black uppercase shadow-xl shadow-emerald-500/20">CONFIRM SYNC</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
