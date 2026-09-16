import { useNavigate} from "react-router-dom";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import Button from "../../components/common/Button";
export default function Landing() {
  const navigate=useNavigate();
  const login=()=>{
    navigate("/login")
  }
  const signup=()=>{
    navigate("/signup")
  }
  return (
    <div className="bg-[#f8f9ff] text-[#0d1c2e] font-['Inter'] text-[16px] leading-6 antialiased flex flex-col min-h-screen">

      
   <Navbar/>

      <main className="grow">

        
        <section className="w-full bg-[#f8f9ff] py-20 lg:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-[#d5e3fc]/20 -skew-y-3 origin-top-left z-0" />

          <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">

            <div className="flex flex-col gap-8 max-w-2xl">

              <div className="inline-flex items-center gap-2 bg-[#dce9ff] text-[#0d1c2e] px-4 py-2 rounded-full w-fit border border-[#c5c5d3]">
                <span className="material-symbols-outlined text-[#00236f] text-sm fill-icon">
                  verified
                </span>

                <span className="text-[12px]  leading-4 font-medium">
                  Trusted by 50+ Municipalities
                </span>
              </div>

              <h1 className="font-['Plus_Jakarta_Sans'] text-[48px]  leading-14 tracking-[-0.02em] font-bold text-[#0d1c2e] md:leading-tight">
                Empower Your Community,
                <br />
                <span className="text-[#1e3a8a]">
                  One Fix at a Time
                </span>
              </h1>

              <p className="text-[18px]  leading-7 font-normal text-[#444651]">
                Report infrastructure issues in seconds, track resolutions in
                real-time, and build a better city together. CivicFix connects
                citizens directly to local authorities with absolute
                transparency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">

                <button className="bg-[#1e3a8a] text-white rounded-lg px-8 py-4 text-[14px]  leading-5 tracking-widerfont-semibold shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
                  Report an Issue

                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>

                <button className="bg-white border border-[#c5c5d3] text-[#0d1c2e] rounded-lg px-8 py-4 text-[14px]  leading-5 tracking-widerfont-semibold hover:bg-[#eff4ff] transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    map
                  </span>

                  See the Map
                </button>
              </div>
            </div>

            
            <div className="relative w-full aspect-square md:aspect-4/3 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#c5c5d3] bg-[#eff4ff]">
              <img
                className="w-full h-full object-cover"
                alt="A bright, modern isometric illustration of a clean city street"
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=90"
              />
            </div>
          </div>
        </section>

        
        <section className="w-full bg-[#f8f9ff] py-8 border-y border-[#c5c5d3]/50">
          <div className="max-w-7xl mx-auto px-4 md:px-10">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#c5c5d3]">

              <div className="flex flex-col gap-2 py-4 md:py-0">
                <span className="font-['Plus_Jakarta_Sans'] text-8 md:text-[48px]  leading-14 font-bold text-[#1e3a8a]">
                  15,000+
                </span>

                <span className="text-[14px]  leading-5 tracking-widerfont-semibold text-[#444651] uppercase tracking-widest">
                  Issues Resolved
                </span>
              </div>

              <div className="flex flex-col gap-2 py-4 md:py-0">
                <span className="font-['Plus_Jakarta_Sans'] text-8 md:text-[48px]  leading-14 font-bold text-[#1e3a8a]">
                  24-Hr
                </span>

                <span className="text-[14px]  leading-5 tracking-widerfont-semibold text-[#444651] uppercase tracking-widest">
                  Average Response
                </span>
              </div>

              <div className="flex flex-col gap-2 py-4 md:py-0">
                <span className="font-['Plus_Jakarta_Sans'] text-8 md:text-[48px]  leading-14 font-bold text-[#1e3a8a]">
                  50,000+
                </span>

                <span className="text-[14px]  leading-5 tracking-widerfont-semibold text-[#444651] uppercase tracking-widest">
                  Civic Heroes
                </span>
              </div>

            </div>
          </div>
        </section>

        
        <section className="w-full bg-[#f8f9ff] py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col gap-8">

            <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
              <h2 className="font-['Plus_Jakarta_Sans'] text-8 leading-10 tracking-[-0.01em] font-bold md:text-10 text-[#0d1c2e]">
                Designed for Action
              </h2>

              <p className="text-[18px]  leading-7 text-[#444651]">
                A streamlined process that turns civic frustration into
                measurable municipal progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

              
              <div className="bg-white border border-[#c5c5d3] rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300">

                <div className="w-14 h-14 rounded-full bg-[#e6eeff] flex items-center justify-center text-[#1e3a8a]">
                  <span className="material-symbols-outlined text-3xl">
                    photo_camera
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-6 leading-8 font-semibold text-[#0d1c2e]">
                    Report in Seconds
                  </h3>

                  <p className="text-[16px] leading-6 text-[#444651]">
                    Snap a photo, confirm the location, and let our AI
                    categorize the issue automatically. No lengthy forms
                    required.
                  </p>
                </div>
              </div>

              
              <div className="bg-white border border-[#c5c5d3] rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300">

                <div className="w-14 h-14 rounded-full bg-[#86f2e4] flex items-center justify-center text-[#006f66]">
                  <span className="material-symbols-outlined text-3xl fill-icon">
                    moving
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-6 leading-8 font-semibold text-[#0d1c2e]">
                    Track Progress
                  </h3>

                  <p className="text-[16px] leading-6 text-[#444651]">
                    Receive real-time push notifications when municipal
                    authorities review, assign, and resolve your reported
                    issue.
                  </p>
                </div>
              </div>

              
              <div className="bg-white border border-[#c5c5d3] rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300">

                <div className="w-14 h-14 rounded-full bg-[#6e2c00] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-3xl">
                    public
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-6 leading-8 font-semibold text-[#0d1c2e]">
                    Community Impact
                  </h3>

                  <p className="text-[16px] leading-6 text-[#444651]">
                    Explore the public map to see aggregate data, trending
                    issues, and how your reports are contributing to a better
                    city.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        
        <section className="w-full bg-[#eff4ff] py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col items-center text-center gap-8">

            <h2 className="font-['Plus_Jakarta_Sans'] text-8 leading-10 font-bold md:text-10 text-[#0d1c2e] max-w-2xl">
              A unified dashboard for citizens and city officials.
            </h2>

            <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-[#c5c5d3]/30 mt-8 relative">
              <img
                className="w-full h-full object-cover"
                alt="Modern civic engagement dashboard displayed on laptop and smartphone"
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=90"
              />
            </div>
          </div>
        </section>

        
        <section className="w-full bg-[#1e3a8a] py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col items-center text-center gap-8">

            <h2 className="font-['Plus_Jakarta_Sans'] text-[48px]  leading-14 tracking-[-0.02em] font-bold text-white">
              Ready to make a difference?
            </h2>

            <p className="text-[18px]  leading-7 text-white/80 max-w-2xl">
              Join tens of thousands of citizens who are actively improving
              their neighborhoods every single day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              
              <Button onClick={signup} variant="outline" className="px-8 py-4">Sign Up for Free</Button>
              <Button onClick={login} className="px-8 py-4 border border-white/30 hover:bg-white/10 transition-colors">Login</Button>

            </div>
          </div>
        </section>

      </main>
      <Footer type="public" />
    </div>
  );
}