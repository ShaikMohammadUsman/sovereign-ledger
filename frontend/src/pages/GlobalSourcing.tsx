import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { 
  Globe2, 
  MapPin, 
  Ship, 
  Search, 
  Filter, 
  ShieldCheck,
  ChevronRight,
  Zap,
  Star,
  X,
  Building,
  ArrowRight,
  Shield,
  Clock,
  Briefcase,
  TrendingUp,
  History,
  Activity,
  Award
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const GlobalSourcing: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const globeRe = useRef<any>();

  const regionsData = [
    { 
      id: 1, 
      name: 'North America Cluster', 
      lat: 40, 
      lng: -100, 
      vendors: 42, 
      risk: 'LOW', 
      color: '#FBB03B',
      details: [{ name: 'Apple Enterprise', type: 'Hardware', volume: '$420k' }, { name: 'AWS Virginia', type: 'Infrastructure', volume: '$1.2M' }] 
    },
    { 
      id: 2, 
      name: 'EU-WEST (Frankfurt)', 
      lat: 50.1, 
      lng: 8.6, 
      vendors: 28, 
      risk: 'LOW', 
      color: '#FBB03B',
      details: [{ name: 'SAP Global', type: 'ERP Services', volume: '$2.1M' }, { name: 'Telekom DE', type: 'Telecom', volume: '$150k' }] 
    },
    { 
      id: 3, 
      name: 'APAC-SOUTH (Singapore)', 
      lat: 1.35, 
      lng: 103.8, 
      vendors: 65, 
      risk: 'MEDIUM', 
      color: '#FBB03B',
      details: [{ name: 'TSMC Advanced', type: 'Semiconductors', volume: '$4.5M' }, { name: 'Global Logistics SG', type: 'Shipping', volume: '$320k' }] 
    },
    { 
      id: 5, 
      name: 'India Tech Hub', 
      lat: 20.59, 
      lng: 78.96, 
      vendors: 52, 
      risk: 'LOW', 
      color: '#FBB03B',
      details: [{ name: 'Infosys Global', type: 'Consulting', volume: '$1.8M' }, { name: 'Tata Motors', type: 'Fleet', volume: '$450k' }] 
    },
    { 
      id: 4, 
      name: 'South America Axis', 
      lat: -14.2, 
      lng: -51.9, 
      vendors: 15, 
      risk: 'MEDIUM', 
      color: '#FBB03B',
      details: [{ name: 'Latam Sourcing', type: 'Materials', volume: '$210k' }] 
    }
  ];

  const arcsData = [
    { startLat: 40, startLng: -100, endLat: 50.1, endLng: 8.6, color: ['#FBB03B', '#FBB03B'] },
    { startLat: 40, startLng: -100, endLat: 1.35, endLng: 103.8, color: ['#FBB03B', '#FBB03B'] },
    { startLat: 40, startLng: -100, endLat: 20.59, endLng: 78.96, color: ['#FBB03B', '#FBB03B'] },
    { startLat: 40, startLng: -100, endLat: -14.2, endLng: -51.9, color: ['#FBB03B', '#FBB03B'] },
  ];

  const partnersData = [
    { id: 'S-01', name: 'Sovereign Logistics', region: 'Global', rating: 4.9, status: 'VERIFIED', icon: Ship, history: '5+ Years Partnered', category: 'Shipping & Freight', activeRequests: 12 },
    { id: 'S-02', name: 'TechnoCore EU', region: 'Germany', rating: 4.8, status: 'STRATEGIC', icon: Zap, history: '3 Years Partnered', category: 'High-Tech Hardware', activeRequests: 5 },
    { id: 'S-03', name: 'Pacific Tech', region: 'Taiwan', rating: 4.7, status: 'PREFERRED', icon: Zap, history: '8 Years Partnered', category: 'Semiconductors', activeRequests: 24 },
  ];

  useEffect(() => {
    if (globeRe.current) {
      globeRe.current.controls().autoRotate = true;
      globeRe.current.controls().autoRotateSpeed = 0.8;
      globeRe.current.pointOfView({ lat: 20, lng: 0, altitude: 2.3 });
    }
  }, []);

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <div className="space-y-2">
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
                 <span>Intelligence</span>
                 <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
                 <span className="text-brand-accent">Supply Cluster Map</span>
              </div>
              <h1 className="text-4xl font-light text-white tracking-tight uppercase leading-none">Global Sourcing</h1>
           </div>
           <div className="px-5 py-3 glass border border-brand-accent/30 rounded-xl bg-brand-accent/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-brand-accent">Live Vector Archive</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10 h-[650px]">
        {/* 3D GLOBE SECTION */}
        <div className="col-span-12 lg:col-span-8 glass rounded-[40px] border border-brand-border bg-[#0B0E14] h-full relative overflow-hidden shadow-[0_0_100px_rgba(251,176,59,0.1)]">
            <div className="w-full h-full">
                <Globe
                    ref={globeRe}
                    width={900}
                    height={650}
                    backgroundColor="rgba(0,0,0,0)"
                    showAtmosphere={true}
                    atmosphereColor="rgba(251, 176, 59, 1)"
                    atmosphereAltitude={0.25}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    
                    pointsData={regionsData}
                    pointColor={() => '#FBB03B'}
                    pointAltitude={0.15}
                    pointRadius={1.5}
                    pointsMerge={false}
                    onPointClick={(d: any) => setSelectedNode(d)}
                    
                    arcsData={arcsData}
                    arcColor={() => 'rgba(251, 176, 59, 0.6)'}
                    arcDashLength={0.5}
                    arcDashGap={0.2}
                    arcDashAnimateTime={1500}
                    arcAltitude={0.4}
                    arcStroke={1.2}

                    labelsData={regionsData}
                    labelLat={(d: any) => d.lat}
                    labelLng={(d: any) => d.lng}
                    labelText={(d: any) => d.vendors}
                    labelSize={1.8}
                    labelColor={() => 'rgba(255, 255, 255, 0.9)'}
                    labelDotRadius={0.6}
                    labelResolution={3}
                    onLabelClick={(d: any) => setSelectedNode(d)}
                    
                    pointLabel={(d: any) => `
                        <div class="glass p-4 rounded-xl border border-brand-accent/20 bg-black/90 backdrop-blur-2xl">
                          <p class="text-[9px] font-black text-brand-accent uppercase tracking-widest mb-1">${d.name}</p>
                          <p class="text-[8px] text-brand-text-secondary uppercase tracking-[0.2em]">${d.vendors} ACTIVE HUBS</p>
                        </div>
                    `}
                />
            </div>

            {/* INTEGRATED REGION PANEL */}
            {selectedNode && (
              <div className="absolute top-8 left-8 w-80 glass rounded-3xl border border-brand-accent/40 bg-[#0B0E14]/90 backdrop-blur-3xl p-8 z-50 animate-in slide-in-from-left-10 duration-500 shadow-[0_0_60px_rgba(251,176,59,0.15)]">
                 <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/30">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-brand-accent uppercase tracking-[0.4em]">Integrated Audit</p>
                       <h3 className="text-xl font-light text-white uppercase tracking-tight leading-none">{selectedNode.name}</h3>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-brand-accent/10 rounded-lg text-brand-text-secondary hover:text-white transition-all"><X className="w-5 h-5" /></button>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="glass p-4 rounded-2xl border border-brand-border/30 bg-white/2">
                          <p className="text-[8px] font-black text-brand-text-secondary uppercase tracking-widest mb-1 opacity-50">Local Vendors</p>
                          <p className="text-2xl font-light text-white tracking-widest leading-none">{selectedNode.vendors}</p>
                       </div>
                       <div className="glass p-4 rounded-2xl border border-brand-border/30 bg-white/2">
                          <p className="text-[8px] font-black text-brand-text-secondary uppercase tracking-widest mb-1 opacity-50">Risk Index</p>
                          <p className={cn("text-xs font-black uppercase tracking-widest leading-none", selectedNode.risk === 'LOW' ? 'text-emerald-500' : 'text-amber-500')}>{selectedNode.risk}</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-4">Regional Entities</h4>
                       {selectedNode.details.map((d: any, i: number) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-brand-border/20 group hover:border-brand-accent/30 transition-all">
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase leading-tight group-hover:text-brand-accent transition-colors">{d.name}</p>
                               <p className="text-[8px] text-brand-text-secondary/60 uppercase tracking-tighter mt-1">{d.type}</p>
                            </div>
                            <p className="text-[10px] font-black text-brand-accent">{d.volume}</p>
                         </div>
                       ))}
                    </div>

                    <button className="w-full mt-4 py-4 bg-brand-accent text-black text-[9px] font-black uppercase tracking-[0.4em] rounded-xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                       Full Audit Ledger <ArrowRight className="w-3 h-3" />
                    </button>
                 </div>
              </div>
            )}
        </div>

        {/* INTEGRATED STRATEGIC SIDEBAR (NO POPUPS) */}
        <div className="col-span-12 lg:col-span-4 glass rounded-[40px] border border-brand-border bg-brand-card/10 h-full relative overflow-hidden flex flex-col">
           
           <div className="p-8 border-b border-brand-border/50 bg-black/5 flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-text-secondary">Strategic Registry</h3>
                 <p className="text-[9px] font-bold text-brand-text-secondary/30 uppercase tracking-[0.2em]">Partner Integrity Logs</p>
              </div>
              <Star className="w-5 h-5 text-brand-accent fill-brand-accent" />
           </div>

           <div className="flex-1 relative overflow-hidden">
              {/* Partner List Container */}
              <div className={cn(
                "absolute inset-0 p-8 space-y-4 overflow-auto custom-scrollbar transition-transform duration-500",
                selectedPartner ? "-translate-x-full" : "translate-x-0"
              )}>
                {partnersData.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedPartner(s)}
                    className="glass rounded-3xl p-6 border border-brand-border/40 hover:border-brand-accent/50 bg-brand-card/10 hover:bg-white/5 transition-all cursor-pointer group flex items-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/3 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest leading-tight italic">{s.name}</h4>
                      <p className="text-[9px] text-brand-text-secondary/50 font-black uppercase tracking-[0.2em] mt-2">{s.region} · {s.status}</p>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center gap-1 text-brand-accent mb-1 justify-end">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-sm font-bold tracking-tighter">{s.rating}</span>
                       </div>
                       <ChevronRight className="w-5 h-5 text-brand-border group-hover:text-white transition-colors ml-auto" />
                    </div>
                  </div>
                ))}
              </div>

              {/* INTEGRATED PARTNER DETAIL DASHBOARD (Drawer style) */}
              {selectedPartner && (
                <div className="absolute inset-0 p-8 z-10 bg-[#0B0E14] animate-in slide-in-from-right-full duration-500 flex flex-col">
                   <button onClick={() => setSelectedPartner(null)} className="flex items-center gap-2 text-[9px] font-black text-brand-text-secondary hover:text-brand-accent uppercase tracking-widest mb-10 transition-colors">
                      <ArrowRight className="w-4 h-4 rotate-180" /> Back to Registry
                   </button>

                   <div className="flex items-center gap-8 mb-12">
                      <div className="w-20 h-20 rounded-[28px] bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center shadow-2xl">
                         <selectedPartner.icon className="w-10 h-10 text-brand-accent" />
                      </div>
                      <div className="space-y-2">
                         <h2 className="text-2xl font-light text-white uppercase tracking-tight leading-none">{selectedPartner.name}</h2>
                         <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-[8px] font-black uppercase tracking-widest">{selectedPartner.status}</span>
                            <p className="text-[9px] font-bold text-brand-text-secondary/40 uppercase tracking-widest italic">{selectedPartner.category}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                         {[
                           { label: 'Active Pipeline', value: selectedPartner.activeRequests, icon: Briefcase },
                           { label: 'Integrity Rating', value: `${selectedPartner.rating}/5.0`, icon: Shield },
                           { label: 'Network Tenure', value: selectedPartner.history, icon: Clock },
                         ].map((m, idx) => (
                           <div key={idx} className="glass p-6 rounded-[30px] border border-brand-border/30 bg-white/2 flex items-center gap-6">
                              <div className="w-10 h-10 rounded-full bg-brand-accent/5 flex items-center justify-center">
                                 <m.icon className="w-4 h-4 text-brand-accent/40" />
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest opacity-30 mb-1">{m.label}</p>
                                 <p className="text-lg font-light text-white tracking-widest">{m.value}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="pt-10 flex flex-col gap-4 mt-auto">
                         <button className="w-full py-5 rounded-2xl bg-brand-accent text-black text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all active:scale-95">Open Contract Vault</button>
                         <button className="w-full py-5 rounded-2xl border border-brand-border text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all">Audit History</button>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 176, 59, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(251, 176, 59, 0.4); }
      `}</style>
    </div>
  );
};

export default GlobalSourcing;
