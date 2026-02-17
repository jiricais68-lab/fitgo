
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DailyActivity, AIInsight, WeeklyGoals, Account, AccountData, Language } from './types';
import { getHealthInsights, getWeeklyGoalRecommendations } from './services/geminiService';
import StatCard from './components/StatCard';
import ActivityChart from './components/ActivityChart';
import { 
  Activity, 
  Moon, 
  Heart, 
  Flame, 
  Plus, 
  Sparkles, 
  TrendingUp,
  BrainCircuit,
  Calendar,
  User,
  Scale,
  Target,
  Zap,
  Info,
  Clock,
  Footprints,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Save,
  LogIn,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  Loader2,
  Languages,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

const STORAGE_KEY_USERS = 'health_ai_users_v2';
const STORAGE_KEY_SESSION = 'health_ai_current_user_email';

const workoutKeys = [
  'badminton', 'basketball', 'biathlon', 'crossCountrySkiing', 'curling', 'cycling', 
  'downhillSkiing', 'figureSkating', 'football', 'golf', 'gym', 'hiking', 
  'iceHockey', 'iceSkating', 'kayaking', 'rockClimbing', 'running', 'sailing', 
  'skiJumping', 'skiTouring', 'sledding', 'snowboarding', 'speedSkating', 
  'surfing', 'swimming', 'tennis', 'volleyball', 'yoga'
];

const enTranslation = {
  login: 'Login', register: 'Register', email: 'Email', password: 'Password', confirmPassword: 'Confirm Password', name: 'Name', birthDate: 'Birth Date', weight: 'Weight',
  loginToAccount: 'Login to your fitness account', dataStoredLocally: 'Data is stored in this browser.',
  passwordRule: '8+ characters and 2+ digits', authenticating: 'Authenticating...', logout: 'Logout',
  addActivity: 'Add Activity', dashboard: 'Dashboard', healthOverview: 'Health overview by FitGo AI Expert.', kcal: 'kcal',
  steps: 'Steps', standing: 'Standing', sleep: 'Sleep', restingHr: 'Resting HR', exercise: 'Exercise', exerciseHr: 'Exercise HR',
  weeklyChallenge: 'Weekly Challenge (Min: 1000+ kcal)', thinking: 'FitGo AI is thinking deeply about your fitness...',
  strictMode: 'Activating strict mode (Min 1000 kcal)', analyzeHistory: 'Analyze History & Suggest Goals',
  dailySteps: 'Daily Steps', weightTrend: 'Weight Trend', aiExpert: 'FitGo Expert AI',
  thinkingAnalysis: 'Model 3 Pro looking for correlations...', runAnalysis: 'Run Physiological Analysis', recordDay: 'Record Day',
  activityDate: 'Activity Date', workoutType: 'Workout Type', activeKcalMin: 'Active Calories (Min 1000!)', mood: 'Mood',
  saveData: 'Save data to FitGo', settings: 'Profile Settings', cancel: 'Cancel', save: 'Save',
  great: 'Great', good: 'Good', average: 'Average', tired: 'Tired', age: 'years', synced: 'Synced', language: 'Language',
  welcome: 'Welcome to FitGo', firstRecordPrompt: 'Enter your first record from Apple Watch. AI expects 1000+ kcal/day.',
  firstRecordBtn: 'Record First Activity',
  errorUserNotFound: 'User not found', errorWrongPassword: 'Incorrect password', errorFillAll: 'Please fill this field',
  errorPasswordsNoMatch: 'Passwords do not match',
  workouts: {
    badminton: 'Badminton', basketball: 'Basketball', biathlon: 'Biathlon', crossCountrySkiing: 'Cross-country Skiing',
    curling: 'Curling', cycling: 'Cycling', downhillSkiing: 'Downhill Skiing', figureSkating: 'Figure Skating',
    football: 'Football', golf: 'Golf', gym: 'Gym', hiking: 'Hiking', iceHockey: 'Ice Hockey', iceSkating: 'Ice Skating',
    kayaking: 'Kayaking', rockClimbing: 'Rock Climbing', running: 'Running', sailing: 'Sailing', skiJumping: 'Ski Jumping',
    skiTouring: 'Ski Touring', sledding: 'Sledding', snowboarding: 'Snowboarding', speedSkating: 'Speed Skating',
    surfing: 'Surfing', swimming: 'Swimming', tennis: 'Tennis', volleyball: 'Volleyball', yoga: 'Yoga'
  }
};

const translations: Record<Language, any> = {
  en: enTranslation,
  cs: {
    ...enTranslation,
    login: 'Přihlášení', register: 'Registrace', email: 'E-mail', password: 'Heslo', confirmPassword: 'Potvrzení hesla', name: 'Jméno', birthDate: 'Narození', weight: 'Váha',
    loginToAccount: 'Přihlaste se ke svému fitness účtu', dataStoredLocally: 'Data jsou uložena v tomto prohlížeči.',
    passwordRule: 'Min. 8 znaků a 2 číslice', authenticating: 'Ověřování...', logout: 'Odhlásit se',
    addActivity: 'Přidat aktivitu', dashboard: 'Dashboard', healthOverview: 'Zdravotní přehled pod dohledem FitGo AI Expert.', kcal: 'kcal',
    steps: 'Kroky', standing: 'Stání', sleep: 'Spánek', restingHr: 'Klidový tep', exercise: 'Cvičení', exerciseHr: 'Tep cvičení',
    weeklyChallenge: 'Týdenní Výzva (Standard: 1000+ kcal)', thinking: 'FitGo AI hluboce přemýšlí nad tvou kondicí...',
    strictMode: 'Aktivuji přísný režim (Min. 1000 kcal)', analyzeHistory: 'Analyzovat historii & Navrhnout cíle',
    dailySteps: 'Denní Kroky', weightTrend: 'Trend Váhy', aiExpert: 'FitGo Expert AI',
    thinkingAnalysis: 'Model 3 Pro hledá souvislosti...', runAnalysis: 'Spustit Fyziologickou Analýzu', recordDay: 'Záznam dne',
    activityDate: 'Datum aktivity', workoutType: 'Typ cvičení', activeKcalMin: 'Aktivní Kalorie (Min 1000!)', mood: 'Nálada',
    saveData: 'Uložit data do FitGo', settings: 'Nastavení Profilu', cancel: 'Zrušit', save: 'Uložit',
    great: 'Skvělý', good: 'Dobrý', average: 'Průměrný', tired: 'Unavený', age: 'let', synced: 'Synchronizováno', language: 'Jazyk',
    welcome: 'Vítejte ve FitGo', firstRecordPrompt: 'Zadejte první záznam z Apple Watch. AI očekává 1000+ kcal denně.',
    firstRecordBtn: 'Zapsat první aktivitu',
    errorUserNotFound: 'Uživatel nenalezen', errorWrongPassword: 'Nesprávné heslo', errorFillAll: 'Toto pole je povinné',
    errorPasswordsNoMatch: 'Hesla se neshodují',
    workouts: {
      badminton: 'Badminton', basketball: 'Basketbal', biathlon: 'Biatlon', crossCountrySkiing: 'Běžecké lyžování',
      curling: 'Curling', cycling: 'Cyklistika', downhillSkiing: 'Sjezdové lyžování', figureSkating: 'Krasobruslení',
      football: 'Fotbal', golf: 'Golf', gym: 'Posilovna', hiking: 'Turistika', iceHockey: 'Lední hokej', iceSkating: 'Bruslení',
      kayaking: 'Kajakářství', rockClimbing: 'Horolezectví', running: 'Běh', sailing: 'Jachting', skiJumping: 'Skoky na lyžích',
      skiTouring: 'Skialpinismus', sledding: 'Sáňkování', snowboarding: 'Snowboarding', speedSkating: 'Rychlobruslení',
      surfing: 'Surfování', swimming: 'Plavání', tennis: 'Tenis', volleyball: 'Volejbal', yoga: 'Jóga'
    }
  },
  de: enTranslation, sk: enTranslation, fr: enTranslation, es: enTranslation, it: enTranslation, pl: enTranslation, nl: enTranslation, pt: enTranslation, sv: enTranslation, hu: enTranslation, da: enTranslation, fi: enTranslation, no: enTranslation, ro: enTranslation, tr: enTranslation, el: enTranslation, ja: enTranslation, zh: enTranslation
};

const languageOptions = [
  { value: 'cs', label: 'Čeština' }, { value: 'en', label: 'English' }
].sort((a, b) => a.label.localeCompare(b.label));

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const App: React.FC = () => {
  const [users, setUsers] = useState<Account[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]'));
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(localStorage.getItem(STORAGE_KEY_SESSION));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const activeAccount = useMemo(() => users.find(u => u.email === currentUserEmail) || null, [users, currentUserEmail]);
  const activeAge = useMemo(() => activeAccount ? calculateAge(activeAccount.birthDate) : 0, [activeAccount]);
  const lang: Language = activeAccount?.language || 'en';
  const t = translations[lang] || translations['en'];

  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('1995-01-01');
  const [weightInput, setWeightInput] = useState(75);
  const [langInput, setLangInput] = useState<Language>('cs');

  const [formData, setFormData] = useState<Partial<DailyActivity>>({
    date: new Date().toISOString().split('T')[0],
    sleepHours: 8, restingHeartRate: 60, maxHeartRate: 160, avgExerciseHeartRate: 140,
    activeCalories: 1000, exerciseMinutes: 60, standHours: 12, steps: 10000,
    workoutType: 'running', mood: 'Dobrý' as any, weight: activeAccount?.baseWeight || 75
  });

  const sortedWorkoutOptions = useMemo(() => {
    return workoutKeys.map(key => ({ key, label: t.workouts?.[key] || key }))
      .sort((a, b) => a.label.localeCompare(b.label, lang));
  }, [t.workouts, lang]);

  const analysisInProgress = useRef(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { currentUserEmail ? localStorage.setItem(STORAGE_KEY_SESSION, currentUserEmail) : localStorage.removeItem(STORAGE_KEY_SESSION); }, [currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail) {
      const saved = localStorage.getItem(`health_data_v2_${currentUserEmail}`);
      if (saved) {
        const parsed: AccountData = JSON.parse(saved);
        setActivities(parsed.activities || []);
        setWeeklyGoals(parsed.weeklyGoals || null);
      }
      setInsights([]);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`health_data_v2_${currentUserEmail}`, JSON.stringify({ activities, weeklyGoals }));
    }
  }, [activities, weeklyGoals, currentUserEmail]);

  const generateData = useCallback(async () => {
    if (!activeAccount || activities.length === 0 || analysisInProgress.current) return;
    analysisInProgress.current = true;
    setIsAnalyzing(true); setIsGeneratingGoals(true);
    const latestWeight = activities[activities.length - 1]?.weight || activeAccount.baseWeight;
    try {
      const insightRes = await getHealthInsights(activities, activeAge, activeAccount.language);
      if (insightRes) setInsights(insightRes);
      setIsAnalyzing(false);
      await new Promise(r => setTimeout(r, 800));
      const goalsRes = await getWeeklyGoalRecommendations(activities, activeAge, latestWeight, activeAccount.language);
      if (goalsRes) setWeeklyGoals(goalsRes);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsAnalyzing(false); setIsGeneratingGoals(false); analysisInProgress.current = false;
    }
  }, [activities, activeAge, activeAccount]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    let errors: Record<string, string> = {};
    if (!emailInput) errors.email = t.errorFillAll;
    if (!passwordInput) errors.password = t.errorFillAll;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      const user = users.find(u => u.email === emailInput);
      if (!user) {
        setFieldErrors({ email: t.errorUserNotFound });
      } else if (user.password !== passwordInput) {
        setFieldErrors({ password: t.errorWrongPassword });
      } else {
        setCurrentUserEmail(user.email);
      }
      setIsAuthenticating(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    let errors: Record<string, string> = {};
    if (!nameInput) errors.name = t.errorFillAll;
    if (!emailInput) errors.email = t.errorFillAll;
    
    // Validace hesla
    const digitsCount = (passwordInput.match(/\d/g) || []).length;
    if (passwordInput.length < 8 || digitsCount < 2) {
      errors.password = t.passwordRule;
    }

    // Dvojité potvrzení
    if (passwordInput !== confirmPasswordInput) {
      errors.confirmPassword = t.errorPasswordsNoMatch;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      const newUser: Account = {
        id: Math.random().toString(36).substr(2, 9),
        name: nameInput, email: emailInput, password: passwordInput,
        birthDate: birthDateInput, baseWeight: weightInput, language: langInput,
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUserEmail(newUser.email);
      setIsAuthenticating(false);
    }, 1000);
  };

  const Ring = ({ size, stroke, percentage, color, icon: Icon }: any) => {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-100" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${color} transition-all duration-1000 ease-out`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">{Icon && <Icon className={`w-1/3 h-1/3 ${color.replace('stroke', 'text')}`} />}</div>
      </div>
    );
  };

  const latest = activities[activities.length - 1] || {
    sleepHours: 0, restingHeartRate: 0, activeCalories: 0, exerciseMinutes: 0, steps: 0, standHours: 0, weight: activeAccount?.baseWeight || 0, avgExerciseHeartRate: 0, maxHeartRate: 0
  };

  if (!activeAccount) {
    const at = translations[langInput] || translations['cs'];
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <div className="bg-rose-500 p-4 rounded-2xl shadow-lg shadow-rose-200"><Activity className="text-white w-8 h-8" /></div>
            </div>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2 uppercase">FitGo</h1>
              <p className="text-slate-400 font-medium text-sm">{at.loginToAccount}</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button onClick={() => { setAuthMode('login'); setFieldErrors({}); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{at.login}</button>
              <button onClick={() => { setAuthMode('register'); setFieldErrors({}); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{at.register}</button>
            </div>
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-6">
              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <input type="text" placeholder={at.name} className={`w-full bg-slate-50 border-2 rounded-xl p-4 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all ${fieldErrors.name ? 'border-red-200' : 'border-slate-50'}`} value={nameInput} onChange={e => { setNameInput(e.target.value); if(fieldErrors.name) setFieldErrors(prev => ({...prev, name: ''})); }} />
                      {fieldErrors.name && <span className="text-red-500 text-[10px] font-bold ml-2 animate-in fade-in slide-in-from-top-1">{fieldErrors.name}</span>}
                    </div>
                    <select value={langInput} onChange={e => setLangInput(e.target.value as Language)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all appearance-none cursor-pointer">
                      {languageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </>
              )}
              
              <div className="flex flex-col gap-1">
                <input type="email" placeholder={at.email} className={`w-full bg-slate-50 border-2 rounded-xl p-4 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all ${fieldErrors.email ? 'border-red-200' : 'border-slate-50'}`} value={emailInput} onChange={e => { setEmailInput(e.target.value); if(fieldErrors.email) setFieldErrors(prev => ({...prev, email: ''})); }} />
                {fieldErrors.email && <span className="text-red-500 text-[10px] font-bold ml-2 animate-in fade-in slide-in-from-top-1">{fieldErrors.email}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={at.password} 
                    className={`w-full bg-slate-50 border-2 rounded-xl p-4 pr-12 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all ${fieldErrors.password ? 'border-red-200' : 'border-slate-50'}`} 
                    value={passwordInput} 
                    onChange={e => { setPasswordInput(e.target.value); if(fieldErrors.password) setFieldErrors(prev => ({...prev, password: ''})); }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="text-red-500 text-[10px] font-bold ml-2 leading-tight animate-in fade-in slide-in-from-top-1">{fieldErrors.password}</span>}
              </div>

              {authMode === 'register' && (
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder={at.confirmPassword} 
                      className={`w-full bg-slate-50 border-2 rounded-xl p-4 pr-12 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all ${fieldErrors.confirmPassword ? 'border-red-200' : 'border-slate-50'}`} 
                      value={confirmPasswordInput} 
                      onChange={e => { setConfirmPasswordInput(e.target.value); if(fieldErrors.confirmPassword) setFieldErrors(prev => ({...prev, confirmPassword: ''})); }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <span className="text-red-500 text-[10px] font-bold ml-2 leading-tight animate-in fade-in slide-in-from-top-1">{fieldErrors.confirmPassword}</span>}
                </div>
              )}

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-[0.98] hover:bg-slate-800 disabled:opacity-50" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? at.login : at.register)}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 animate-in fade-in duration-700">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-2 rounded-lg"><Activity className="text-white w-5 h-5" /></div>
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight">FitGo</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeAge} {t.age} • {activeAccount.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsEditingProfile(true)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"><Settings2 className="w-5 h-5" /></button>
            <button onClick={() => setCurrentUserEmail(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><LogOut className="w-5 h-5" /></button>
            <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"><Plus className="w-4 h-4" /><span>{t.addActivity}</span></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activities.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Activity className="w-10 h-10 text-slate-300" /></div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">{t.welcome}, {activeAccount.name}</h3>
             <p className="text-slate-400 mb-8 max-w-sm mx-auto">{t.firstRecordPrompt}</p>
             <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">{t.firstRecordBtn}</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard title={t.steps} value={latest.steps.toLocaleString()} unit="" icon={<Footprints className="text-violet-600 w-5 h-5" />} colorClass="bg-violet-50" />
              <StatCard title={t.sleep} value={latest.sleepHours} unit="h" icon={<Moon className="text-indigo-600 w-5 h-5" />} colorClass="bg-indigo-50" />
              <StatCard title={t.restingHr} value={latest.restingHeartRate} unit="BPM" icon={<Heart className="text-rose-600 w-5 h-5" />} colorClass="bg-rose-50" />
              <StatCard title="Active Kcal" value={latest.activeCalories} unit="kcal" icon={<Flame className="text-orange-600 w-5 h-5" />} colorClass="bg-orange-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative group">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Target className="w-6 h-6 text-indigo-600" />{t.weeklyChallenge}</h3>
                      <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-600" /><span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">FitGo AI</span></div>
                    </div>
                    {isGeneratingGoals ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-600 text-sm font-bold animate-pulse">{t.thinking}</p>
                      </div>
                    ) : weeklyGoals ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                          <div className="flex flex-col items-center gap-4">
                            <Ring size={120} stroke={12} percentage={Math.min((latest.activeCalories / (weeklyGoals.moveKcal || 1000)) * 100, 100)} color="stroke-rose-500" icon={Flame} />
                            <p className="text-lg font-black text-slate-800">{weeklyGoals.moveKcal} <span className="text-xs font-bold text-slate-400">kcal</span></p>
                          </div>
                          <div className="flex flex-col items-center gap-4">
                            <Ring size={120} stroke={12} percentage={Math.min((latest.exerciseMinutes / (weeklyGoals.exerciseMin || 1)) * 100, 100)} color="stroke-emerald-500" icon={Activity} />
                            <p className="text-lg font-black text-slate-800">{weeklyGoals.exerciseMin} <span className="text-xs font-bold text-slate-400">min</span></p>
                          </div>
                          <div className="flex flex-col items-center gap-4">
                            <Ring size={120} stroke={12} percentage={Math.min((latest.standHours / (weeklyGoals.standHours || 1)) * 100, 100)} color="stroke-cyan-500" icon={Clock} />
                            <p className="text-lg font-black text-slate-800">{weeklyGoals.standHours} <span className="text-xs font-bold text-slate-400">h</span></p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{weeklyGoals.reasoning}"</p>
                        </div>
                      </div>
                    ) : (
                      <button onClick={generateData} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-500 transition-all flex flex-col items-center gap-2">
                        <BrainCircuit className="w-8 h-8" /><span>{t.analyzeHistory}</span>
                      </button>
                    )}
                  </div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest flex items-center gap-2"><Footprints className="w-4 h-4 text-violet-500" />{t.dailySteps}</h4>
                      <ActivityChart data={activities} type="steps" />
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest flex items-center gap-2"><Scale className="w-4 h-4 text-cyan-500" />{t.weightTrend}</h4>
                      <ActivityChart data={activities} type="weight" />
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-rose-500 p-2 rounded-xl"><Sparkles className="w-6 h-6 text-white" /></div>
                    <h3 className="font-bold text-xl tracking-tight uppercase">{t.aiExpert}</h3>
                  </div>
                  <div className="space-y-4 relative z-10">
                    {isAnalyzing ? (
                      <div className="py-12 flex flex-col items-center"><div className="w-10 h-10 border-4 border-white/10 border-t-rose-500 rounded-full animate-spin mb-4" /><p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Analyzing...</p></div>
                    ) : insights.length > 0 ? (
                      insights.map((insight, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all duration-300 animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 150}ms` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <ChevronRight className="w-4 h-4 text-rose-500" />
                            <h4 className="font-bold text-sm text-white">{insight.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{insight.content}</p>
                        </div>
                      ))
                    ) : (
                      <button onClick={generateData} className="w-full bg-rose-500 py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-white hover:bg-rose-600 transition-all">{t.runAnalysis}</button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
                  <h4 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] self-start">Daily Progress</h4>
                  <div className="relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Steps</span>
                      <span className="text-2xl font-black text-slate-800">{latest.steps}</span>
                    </div>
                    <Ring size={180} stroke={18} percentage={Math.min((latest.steps / 10000) * 100, 100)} color="stroke-rose-500" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-xl text-slate-800 uppercase italic">Add Entry</h3>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-all text-2xl">&times;</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setActivities(p => [...p, { ...formData as any, id: Math.random().toString() }]); setShowForm(false); setTimeout(generateData, 500); }} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label><input type="date" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workout</label><select className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 text-sm font-bold text-black focus:border-rose-500/30 outline-none transition-all cursor-pointer" value={formData.workoutType} onChange={e => setFormData({...formData, workoutType: e.target.value})}>
                  {sortedWorkoutOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                </select></div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Steps</label><input type="number" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 text-sm font-bold text-black" value={formData.steps} onChange={e => setFormData({...formData, steps: parseInt(e.target.value)})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleep (h)</label><input type="number" step="0.1" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 text-sm font-bold text-black" value={formData.sleepHours} onChange={e => setFormData({...formData, sleepHours: parseFloat(e.target.value)})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Active Kcal</label><input type="number" required className="w-full bg-slate-50 border-2 border-rose-500/30 rounded-xl p-4 text-sm font-bold text-rose-600" value={formData.activeCalories} onChange={e => setFormData({...formData, activeCalories: parseInt(e.target.value)})} /></div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Save Session</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
