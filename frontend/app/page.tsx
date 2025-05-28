"use client";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, BookOpen, MapPin, Shield, ArrowRight, CheckCircle, Star } from "lucide-react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Clock,
      title: "Conflict-Free Scheduling",
      description: "Intelligent conflict detection prevents double-booking of faculty and classrooms",
      color: "blue",
      delay: "0s"
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Separate dashboards for administrators and faculty with role-based permissions",
      color: "green",
      delay: "0.1s"
    },
    {
      icon: BookOpen,
      title: "Subject Management",
      description: "Comprehensive subject allocation across batches, branches, and semesters",
      color: "purple",
      delay: "0.2s"
    },
    {
      icon: MapPin,
      title: "Classroom Optimization",
      description: "Efficient classroom allocation with capacity management and availability tracking",
      color: "orange",
      delay: "0.3s"
    },
    {
      icon: Calendar,
      title: "Multiple Views",
      description: "View timetables by section, faculty, classroom, or department with export options",
      color: "red",
      delay: "0.4s"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "JWT-based authentication with secure data management and backup systems",
      color: "indigo",
      delay: "0.5s"
    }
  ]

  const stats = [
    { value: "500+", label: "Faculty Members", color: "blue" },
    { value: "50+", label: "Departments", color: "green" },
    { value: "1000+", label: "Subjects", color: "purple" },
    { value: "99.9%", label: "Uptime", color: "orange" }
  ]

  interface Feature {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    title: string
    description: string
    color: "blue" | "green" | "purple" | "orange" | "red" | "indigo"
    delay: string
  }

  interface Stat {
    value: string
    label: string
    color: "blue" | "green" | "purple" | "orange"
  }

  const getColorClasses = (color: "blue" | "green" | "purple" | "orange" | "red" | "indigo") => ({
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
    indigo: "text-indigo-600"
  }[color])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6 animate-bounce">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 100+ Engineering Institutes
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Timetable Management
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                for Engineering Institutes
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Streamline your academic scheduling with our comprehensive timetable management system. 
              <span className="text-blue-600 font-semibold"> Eliminate conflicts</span>,
              <span className="text-green-600 font-semibold"> optimize resources</span>, and
              <span className="text-purple-600 font-semibold"> enhance educational efficiency</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-4 text-lg font-semibold border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`text-center mb-20 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for Academic Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage complex academic schedules with precision and efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{animationDelay: feature.delay}}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card className={`h-full hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg ${hoveredCard === index ? 'ring-2 ring-blue-200' : ''}`}>
                    <CardHeader className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 flex items-center justify-center mb-6 transform transition-transform duration-300 ${hoveredCard === index ? 'rotate-6 scale-110' : ''}`}>
                        <Icon className={`h-8 w-8 ${getColorClasses(feature.color)}`} />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`text-center mb-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Educational Leaders</h2>
            <p className="text-xl text-blue-200">Join thousands of institutions already using our platform</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-700 delay-${(index + 1) * 100} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className={`text-5xl md:text-6xl font-bold ${getColorClasses(stat.color)} mb-3 animate-pulse`}>
                    {stat.value}
                  </div>
                  <div className="text-blue-100 text-lg font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Scheduling?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join the revolution in academic timetable management. Start your free trial today.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  TimeTable Pro
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Revolutionizing academic scheduling for engineering institutes worldwide with cutting-edge technology.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <div key={social} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                    <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Features",
                items: ["Timetable Management", "Faculty Scheduling", "Classroom Allocation", "Conflict Detection"]
              },
              {
                title: "Support",
                items: ["Documentation", "Help Center", "Contact Support", "Training"]
              },
              {
                title: "Contact",
                items: ["support@timetablepro.com", "+1 (555) 123-4567", "123 Education St.", "Academic City, AC 12345"]
              }
            ].map((section, index) => (
              <div key={index} className="md:col-span-1">
                <h4 className="text-lg font-bold mb-6 text-blue-400">{section.title}</h4>
                <ul className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 TimeTable Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-400">
              {['Privacy Policy', 'Terms of Service', 'Cookies'].map((link) => (
                <span key={link} className="hover:text-white transition-colors duration-300 cursor-pointer">
                  {link}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}