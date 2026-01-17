import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Users, Award, ExternalLink } from "lucide-react";

export const AboutUs = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          QkdXplore Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Bridging the gap between quantum theory and practical application through interactive education
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* About Us section */}
        <Card className="border-none shadow-soft bg-white dark:bg-slate-950 flex flex-col h-full">
          <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Award className="w-5 h-5" />
              </span>
              About Project
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
              <p>
                This Quantum Key Distribution (QKD) E-Laboratory is developed as a project for
                the <strong className="text-gray-900 dark:text-gray-100">Amravati Quantum Valley Hackathon (AQVH) 2025</strong>, IIC Andhra Pradesh by <strong className="text-blue-600 dark:text-blue-400">Team QuSec</strong>.
              </p>
              <p>
                The lab provides an interactive platform to understand and experiment with the BB84 protocol, 
                a fundamental quantum cryptography protocol developed by Charles Bennett and Gilles Brassard in 1984.
                Our mission is to make quantum concepts accessible to students and researchers worldwide.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Affiliation</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    Department of Electronics and Telecommunication<br />
                    Vivekanand Education Society's Institute of Technology
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Team section */}
        <Card className="border-none shadow-soft bg-white dark:bg-slate-950 flex flex-col h-full">
          <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
               <span className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                <Users className="w-5 h-5" />
              </span>
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">Mentors</h4>
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-100 dark:border-purple-800/20">
                    <ul className="space-y-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <li>Dr. Ranjan Bala Jain</li>
                        <li>Mrs. Anuradha Jadiya</li>
                    </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Team QuSec Members</h4>
                <div className="grid grid-cols-2 gap-3">
                    {["Aniruddha Gharat", "Arundhati Nair", "Harsh Mhadgut", "Shantaram Chari", "Sharavani Kale", "Tejas Naringrekar"].map((member) => (
                        <div key={member} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            {member}
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Have feedback?</h4>
                        <p className="text-xs text-gray-500">Help us improve the lab</p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10"
                        onClick={() => window.location.href = 'mailto:qkdxplore@gmail.com'}
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Us
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};