"use client";

import React from "react";
import {
  Phone,
  PieChart,
  Users,
  Layers,
  PhoneOff,
  Settings,
  LogOut,
  Search,
  Clock,
  Info,
  Database,
  Globe
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { time: "7 am", uv: 2.5, pv: 2.5 },
  { time: "8 am", uv: 1.8, pv: 2.8 },
  { time: "9 am", uv: 2.6, pv: 2.1 },
  { time: "10 am", uv: 2.4, pv: 2.8 },
  { time: "11 am", uv: 3.1, pv: 3.1 },
  { time: "12 am", uv: 2.4, pv: 2.8 },
  { time: "1 pm",  uv: 1.2, pv: 2.4 },
  { time: "2 pm",  uv: 1.2, pv: 2.5 },
  { time: "3 pm",  uv: 3.8, pv: 2.8 },
  { time: "4 pm",  uv: 2.4, pv: 2.6 },
  { time: "5 pm",  uv: 2.7, pv: 2.4 },
  { time: "6 pm",  uv: 2.4, pv: 2.4 },
  { time: "7 pm",  uv: 2.8, pv: 2.8 },
  { time: "8 pm",  uv: 2.6, pv: 2.9 },
  { time: "9 pm",  uv: 2.2, pv: 1.8 },
  { time: "10 pm", uv: 2.5, pv: 3.2 },
];

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 bg-panel m-4 rounded-3xl flex flex-col items-center py-8 gap-8 border border-border">
        <div className="flex-1 flex flex-col gap-6">
          <div className="p-3 bg-panel rounded-full relative group cursor-pointer text-accent">
            <div className="absolute inset-0 bg-accent/20 blur-md rounded-full"></div>
            <Phone className="w-6 h-6 relative z-10" />
          </div>
          <div className="p-3 text-muted hover:text-foreground cursor-pointer transition-colors">
            <PieChart className="w-6 h-6" />
          </div>
          <div className="p-3 text-muted hover:text-foreground cursor-pointer transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div className="p-3 text-muted hover:text-foreground cursor-pointer transition-colors">
            <Layers className="w-6 h-6" />
          </div>
          <div className="p-3 text-muted hover:text-foreground cursor-pointer transition-colors relative">
            <PhoneOff className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-danger text-[10px] flex items-center justify-center rounded-full font-bold">
              2
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-6 mt-auto">
          <div className="p-3 text-muted hover:text-foreground cursor-pointer transition-colors">
            <Settings className="w-6 h-6" />
          </div>
          <div className="p-3 text-muted hover:text-foreground cursor-pointer transition-colors">
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 pl-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">nix<span className="text-accent">Tio</span></h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-panel px-4 py-2 rounded-full flex items-center gap-2 border border-border">
              <Search className="w-5 h-5 text-muted" />
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-panel border border-border rounded-full py-1.5 px-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-panel z-30"></div>
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-panel z-20"></div>
                  <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-panel z-10"></div>
                  <div className="w-6 h-6 rounded-full bg-white text-background text-xs flex items-center justify-center font-bold z-0 border-2 border-panel">+12</div>
                </div>
                <span className="text-sm font-medium"><span className="text-white">12 of 15</span> <span className="text-muted">on work</span></span>
              </div>
              <div className="bg-panel border border-border rounded-full py-1.5 px-4">
                <span className="text-sm font-medium"><span className="text-white">2</span> <span className="text-muted">on break</span></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold">James Radcliffe</div>
                <div className="text-xs text-muted">Admin</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-avatar p-[2px]">
                <div className="w-full h-full rounded-full bg-card overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=James`} alt="User" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-6 mt-4 overflow-y-auto pr-2">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Statistics Section */}
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-semibold">Statistics</h2>
                <div className="flex gap-4 text-sm font-medium">
                  <button className="text-white">Days</button>
                  <button className="text-muted hover:text-white">Weeks</button>
                  <button className="text-muted hover:text-white">Months</button>
                </div>
              </div>

              {/* Days Selector */}
              <div className="flex gap-2 mb-8">
                {[
                  { num: "01", day: "Sat" }, { num: "02", day: "Sun" }, { num: "03", day: "Mon" },
                  { num: "04", day: "Tue" }, { num: "05", day: "Wed" }, { num: "06", day: "Thu" },
                  { num: "07", day: "Fri" }, { num: "08", day: "Sat" }, { num: "09", day: "Sun" },
                ].map((d) => (
                  <div key={d.num} className="flex-1 bg-panel border border-border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-card transition-colors">
                    <span className="text-lg font-bold">{d.num}</span>
                    <span className="text-xs text-muted">{d.day}</span>
                  </div>
                ))}
                
                {/* Active Day */}
                <div className="flex-1 bg-gradient-accent rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer text-background shadow-[0_0_20px_rgba(168,85,247,0.4)] relative transform scale-110 z-10">
                  <span className="text-lg font-bold">10</span>
                  <span className="text-xs font-semibold">Mon</span>
                </div>

                {[
                  { num: "11", day: "Tue" }, { num: "12", day: "Wed" }, { num: "13", day: "Thu" },
                ].map((d) => (
                  <div key={d.num} className="flex-1 bg-panel border border-border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-card transition-colors">
                    <span className="text-lg font-bold">{d.num}</span>
                    <span className="text-xs text-muted">{d.day}</span>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#8B8997", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8B8997", fontSize: 12 }} tickFormatter={(val) => `${val}h`} />
                    <Tooltip contentStyle={{ backgroundColor: "#15131C", border: "1px solid #252233", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="uv" stroke="#a855f7" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="pv" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Ongoing Calls */}
            <section className="mt-4">
              <h2 className="text-2xl font-semibold mb-6 px-2">Ongoing Calls</h2>
              <div className="flex gap-4">
                {/* Card 1 */}
                <div className="flex-1 bg-[#1A1625] rounded-3xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-card">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia" alt="Sophia" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Sophia Hayes</h3>
                      <div className="flex items-center gap-1 bg-background px-2 py-0.5 rounded-full mt-1 w-fit border border-border">
                        <Phone className="w-3 h-3 text-muted" />
                        <span className="text-xs font-mono">01:54:38</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-success">
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">34</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="w-4 h-4" />
                      <span className="text-foreground">2h 45m</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 py-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted" />
                      <span>David Barr</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted">
                      <Info className="w-4 h-4" />
                      <span className="text-foreground">2</span>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${i % 7 === 0 ? 'bg-warning' : i % 5 === 0 ? 'bg-border' : 'bg-accent'}`}></div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted mt-auto">
                    <span>ID 35774</span>
                    <div className="flex gap-2">
                      <Database className="w-4 h-4" />
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="flex-1 bg-[#1A1625] rounded-3xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-card">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Owen" alt="Owen" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Owen Darnell</h3>
                      <div className="flex items-center gap-1 bg-background px-2 py-0.5 rounded-full mt-1 w-fit border border-border">
                        <Phone className="w-3 h-3 text-muted" />
                        <span className="text-xs font-mono">01:54:38</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-danger">
                      <PhoneOff className="w-4 h-4" />
                      <span className="font-semibold">10</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="w-4 h-4" />
                      <span className="text-foreground">3h 10m</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 py-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted" />
                      <span>Kilian Schönberger</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted">
                      <Info className="w-4 h-4" />
                      <span className="text-foreground">4</span>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${i % 3 === 0 ? 'bg-warning' : i % 4 === 0 ? 'bg-border' : 'bg-accent'}`}></div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted mt-auto">
                    <span>ID 98745</span>
                    <div className="flex gap-2">
                      <Database className="w-4 h-4" />
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="flex-1 bg-[#1A1625] rounded-3xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-card">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" alt="Emma" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Emma Larkin</h3>
                      <div className="flex items-center gap-1 bg-background px-2 py-0.5 rounded-full mt-1 w-fit border border-border">
                        <Phone className="w-3 h-3 text-muted" />
                        <span className="text-xs font-mono">01:51:43</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-success">
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">29</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="w-4 h-4" />
                      <span className="text-foreground">6h 29m</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 py-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted" />
                      <span>Jürgen Petersen</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted">
                      <Info className="w-4 h-4" />
                      <span className="text-foreground">8</span>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${i % 5 === 0 ? 'bg-warning' : i % 2 === 0 ? 'bg-border' : 'bg-accent'}`}></div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted mt-auto">
                    <span>ID 85427</span>
                    <div className="flex gap-2">
                      <Database className="w-4 h-4" />
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="w-72 flex flex-col gap-6 pl-2">
            {/* Starting Calls */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Starting calls</h2>
              <div className="flex flex-col gap-3">
                <div className="bg-panel border border-border rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Liam" alt="Liam" />
                  </div>
                  <span className="font-medium">Liam Grayson</span>
                </div>
                <div className="bg-panel border border-border rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mia" alt="Mia" />
                  </div>
                  <span className="font-medium">Mia Jennings</span>
                </div>
              </div>
            </div>

            {/* Break */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Break</h2>
              <div className="flex flex-col gap-3">
                {/* Break Item 1 */}
                <div className="bg-panel border border-border rounded-2xl p-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" alt="Jack" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Jack Linton</div>
                      <div className="text-xs text-muted">Cigarette break</div>
                    </div>
                  </div>
                  <div className="bg-warning text-background text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    00:17
                  </div>
                </div>

                {/* Break Item 2 */}
                <div className="bg-panel border border-border rounded-2xl p-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel" alt="Samuel" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Samuel Waters</div>
                      <div className="text-xs text-muted">Lunch break</div>
                    </div>
                  </div>
                  <div className="bg-accent-light text-background text-xs font-bold px-2 py-0.5 rounded-full z-10 shadow-[0_0_10px_rgba(232,121,249,0.5)]">
                    00:19
                  </div>
                </div>

                {/* Break Item 3 */}
                <div className="bg-panel border border-border rounded-2xl p-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Henry" alt="Henry" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Henry Mercer</div>
                      <div className="text-xs text-muted">Lunch break</div>
                    </div>
                  </div>
                  <div className="bg-accent-light text-background text-xs font-bold px-2 py-0.5 rounded-full z-10 shadow-[0_0_10px_rgba(232,121,249,0.5)]">
                    10:51
                  </div>
                </div>

                {/* Break Item 4 */}
                <div className="bg-panel border border-border rounded-2xl p-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia" alt="Amelia" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Amelia Rowann</div>
                      <div className="text-xs text-muted">Cigarette break</div>
                    </div>
                  </div>
                  <div className="bg-warning text-background text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    30:42
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Promo */}
            <div className="mt-auto bg-gradient-accent rounded-3xl p-6 relative overflow-hidden h-36">
               <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-0"></div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-accent z-30"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-accent z-20"></div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-accent z-10"></div>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mt-auto">
                    +278k
                  </h3>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
