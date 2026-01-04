
import React, { useState } from 'react';
import { BookOpen, Target, Search, Zap, Network, ShieldCheck, ClipboardList, TrendingUp, ChevronRight, Fingerprint, Scale, FileText, Copy, Check } from 'lucide-react';

const methodologySteps = [
  {
    title: "Define Scope and Objectives",
    icon: <Target className="w-6 h-6" />,
    content: "Clearly define the scope of the security test, including systems, networks, applications, and assets to be evaluated. Establish specific objectives such as identifying critical vulnerabilities, testing connectivity resilience, and validating protection mechanisms."
  },
  {
    title: "Vulnerability Assessment",
    icon: <Search className="w-6 h-6" />,
    content: "Utilize automated tools like Nessus, OpenVAS, or Qualys to scan for known vulnerabilities in systems, applications, and network infrastructure. Conduct manual penetration testing to identify complex vulnerabilities that automated tools might miss. Focus on common attack vectors such as SQL injection, cross-site scripting (XSS), remote code execution, and privilege escalation."
  },
  {
    title: "Exploit Vulnerabilities",
    icon: <Zap className="w-6 h-6" />,
    content: "Once vulnerabilities are identified, attempt to exploit them to demonstrate potential impact and assess the severity. Use tools like Metasploit or custom scripts to exploit vulnerabilities in a controlled environment. Document successful exploits and potential attack paths for further analysis."
  },
  {
    title: "Connectivity Testing",
    icon: <Network className="w-6 h-6" />,
    content: "Assess network connectivity to identify potential entry points for attackers. Conduct port scanning to discover open ports and services running on target systems. Analyze firewall configurations to ensure they effectively control inbound and outbound traffic. Perform network sniffing to capture and analyze traffic for potential security weaknesses."
  },
  {
    title: "Protection Evaluation",
    icon: <ShieldCheck className="w-6 h-6" />,
    content: "Evaluate existing security controls such as firewalls, intrusion detection/prevention systems, antivirus solutions, and endpoint protection. Test the effectiveness of access control mechanisms such as authentication, authorization, and encryption. Assess the configuration of security devices and ensure they are properly hardened and updated. Analyze logging and monitoring capabilities to detect and respond to security incidents effectively."
  },
  {
    title: "Reporting and Remediation",
    icon: <ClipboardList className="w-6 h-6" />,
    content: "Document findings, including identified vulnerabilities, exploited weaknesses, connectivity risks, and recommendations for improvement. Prioritize vulnerabilities based on severity and potential impact on the organization. Provide detailed remediation steps to address identified issues, including patches, configuration changes, and security best practices."
  },
  {
    title: "Continuous Improvement",
    icon: <TrendingUp className="w-6 h-6" />,
    content: "Regularly review and update security testing methodologies to adapt to evolving threats and technologies. Conduct periodic security assessments to validate the effectiveness of security controls and identify new vulnerabilities. Foster a culture of security awareness and encourage collaboration between security teams and other stakeholders to mitigate risks effectively."
  }
];

const MIT_LICENSE = `MIT License

Copyright (c) 2025 REXDEVCYBER

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const Resources: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyLicense = () => {
    navigator.clipboard.writeText(MIT_LICENSE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Mission Section */}
      <div className="mb-20" id="mission">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Fingerprint className="w-3 h-3" />
          <span>REXDEVCYBER Mission Statement</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight uppercase italic tracking-tighter">
              A Network for <span className="text-emerald-400">Storing</span> & Learning.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 font-medium">
              REXDEVCYBER is a Cyber-Tech-Explorer network for storing online account information—a fiber network archive that stores statistics and traffic database blocks. Our mission is to make it easier for everyone to create beneficial learning, guidance and development resources.
            </p>
            <div className="bg-emerald-500 text-black p-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <p className="font-bold text-sm leading-relaxed italic">
                "templates are Quality and practical should be available to everyone. Use our open source products or support us by purchasing one of our premium products or services."
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700">
                <Network className="w-48 h-48 rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Growth & Beyond</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Check out and greatly update the area for reliable, direct, important news every day. Gather information from every part of the investigation in order to use important information for users to be safe and reduce information risk.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['Reliable News', 'Investigation Logs', 'Risk Reduction', 'Secure Growth'].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <ChevronRight className="w-3 h-3" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="border-t border-white/5 pt-20 mb-24" id="methodology">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Security <span className="text-emerald-400">Methodology</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Advanced system vulnerability exploits, connectivity and protection framework used by the REXDEVCYBER investigative team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-3">
            {methodologySteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-full flex items-center p-5 rounded-2xl transition-all text-left group ${
                  activeStep === index 
                  ? 'bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                  : 'glass-card text-gray-400 hover:border-emerald-500/40 hover:translate-x-2'
                }`}
              >
                <div className={`mr-4 p-2 rounded-xl ${activeStep === index ? 'bg-black/20' : 'bg-white/5 group-hover:bg-emerald-500/10'}`}>
                  {React.cloneElement(step.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                </div>
                <span className="text-xs font-black uppercase tracking-widest leading-none">{step.title}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card p-12 rounded-[3rem] h-full border-emerald-500/20 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                {methodologySteps[activeStep].icon}
              </div>
              
              <div className="flex items-center space-x-6 mb-10">
                <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                  {methodologySteps[activeStep].icon}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    {methodologySteps[activeStep].title}
                  </h3>
                  <div className="text-[10px] text-emerald-500 font-black tracking-[0.3em] mt-1">FRAMEWORK PHASE 0{activeStep + 1}</div>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed font-medium mb-12 flex-grow">
                {methodologySteps[activeStep].content}
              </p>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex space-x-2">
                   {[...Array(7)].map((_, i) => (
                     <div key={i} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${i === activeStep ? 'bg-emerald-500 w-16' : 'bg-white/10'}`} />
                   ))}
                </div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Proprietary Assessment Protocol</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License Section */}
      <div className="border-t border-white/5 pt-20" id="license">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Scale className="w-3 h-3" />
          <span>Legal Compliance & Licensing</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter">Terms & <span className="text-emerald-400">License</span></h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              At REXDEVCYBER, we believe in radical transparency. Our open-source tools are released under the MIT License, while our premium products are subject to specific commercial terms.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="mt-1 p-1 bg-emerald-500/10 rounded">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Open Source tools are freely available for modification.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="mt-1 p-1 bg-emerald-500/10 rounded">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Premium assets include lifetime updates and support.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="mt-1 p-1 bg-red-500/10 rounded">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Redistribution of premium database blocks is prohibited.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] overflow-hidden border-white/10 flex flex-col h-full bg-black/40">
              <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">MIT LICENSE AGREEMENT</span>
                </div>
                <button 
                  onClick={copyLicense}
                  className="flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-emerald-400 transition-all uppercase tracking-widest"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <div className="p-8 flex-grow">
                <pre className="font-mono text-[11px] leading-relaxed text-gray-500 whitespace-pre-wrap">
                  {MIT_LICENSE}
                </pre>
              </div>
              <div className="bg-emerald-500/5 p-6 flex items-center justify-between border-t border-white/5">
                <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">© 2025 REXDEVCYBER Open Source Initiative</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple AlertCircle local import if needed since it was used but not imported
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default Resources;
