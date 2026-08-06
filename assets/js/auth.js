
const configured = () =>
  window.SUNNY_RISE_SUPABASE_URL &&
  !window.SUNNY_RISE_SUPABASE_URL.includes("PASTE_") &&
  window.SUNNY_RISE_SUPABASE_ANON_KEY &&
  !window.SUNNY_RISE_SUPABASE_ANON_KEY.includes("PASTE_");

const client = configured()
  ? window.supabase.createClient(window.SUNNY_RISE_SUPABASE_URL, window.SUNNY_RISE_SUPABASE_ANON_KEY)
  : null;

function message(text, ok=false){
  const el=document.getElementById("msg"); if(!el)return;
  el.textContent=text; el.className="msg show "+(ok?"ok":"err");
}
function requireConfig(){
  if(client)return true;
  message("Supabase is not configured yet. Add your Project URL and anon/publishable key in assets/js/supabase-config.js.");
  return false;
}
async function signUp(e){
  e.preventDefault(); if(!requireConfig())return;
  const email=document.getElementById("email").value.trim(), password=document.getElementById("password").value;
  const confirm=document.getElementById("confirm").value;
  if(password.length<6)return message("Password must contain at least 6 characters.");
  if(password!==confirm)return message("Passwords do not match.");
  const btn=e.submitter; btn.disabled=true;
  const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:new URL("login.html",location.href).href}});
  btn.disabled=false;
  if(error)return message(error.message);
  message(data.session ? "Account created. You are signed in." : "Account created. Check your email to confirm your account.",true);
}
async function login(e){
  e.preventDefault(); if(!requireConfig())return;
  const btn=e.submitter; btn.disabled=true;
  const {error}=await client.auth.signInWithPassword({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value});
  btn.disabled=false;
  if(error)return message(error.message);
  location.href="profile.html";
}
async function forgot(e){
  e.preventDefault(); if(!requireConfig())return;
  const {error}=await client.auth.resetPasswordForEmail(document.getElementById("email").value.trim(),{redirectTo:new URL("reset-password.html",location.href).href});
  if(error)return message(error.message);
  message("Password reset link sent. Check your email.",true);
}
async function resetPassword(e){
  e.preventDefault(); if(!requireConfig())return;
  const p=document.getElementById("password").value, c=document.getElementById("confirm").value;
  if(p.length<6)return message("Password must contain at least 6 characters.");
  if(p!==c)return message("Passwords do not match.");
  const {error}=await client.auth.updateUser({password:p});
  if(error)return message(error.message);
  message("Password updated. You can continue to your profile.",true);
}
async function loadProfile(){
  if(!requireConfig())return;
  const {data:{session}}=await client.auth.getSession();
  if(!session){location.href="login.html";return}
  document.getElementById("userEmail").textContent=session.user.email||"—";
  document.getElementById("userId").textContent=session.user.id;
}
async function logout(){ if(client) await client.auth.signOut(); location.href="../index.html"; }
