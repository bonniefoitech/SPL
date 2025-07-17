import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Zap, 
  ChevronRight, 
  Star,
  Play,
  CheckCircle,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-white/5 rounded-full blur-3xl animate-pulse z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000 z-0"></div>
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              SPL
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 sm:px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/20"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 sm:px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto mt-16 sm:mt-0">
          <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              Create Your Stock
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-blue-300 bg-clip-text text-transparent">
                Dream Team
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto font-medium">
              Experience the thrill of fantasy sports meets stock market investing. 
              Build your portfolio, compete with friends, and win real prizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <button
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {user ? 'Go to Dashboard' : 'Start Playing Now'}
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20 flex items-center gap-2 w-full sm:w-auto justify-center">
                Watch Demo
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Why Choose SPL?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Revolutionary features that combine the best of fantasy sports and financial markets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Real-Time Performance",
                description: "Track your stock team's performance with live market data and instant updates",
                gradient: "from-emerald-400 to-blue-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Multiplayer Leagues",
                description: "Compete with friends and players worldwide in custom leagues and tournaments",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Win Real Prizes",
                description: "Earn cash prizes, gift cards, and exclusive rewards based on your portfolio performance",
                gradient: "from-amber-400 to-orange-500"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Advanced Analytics",
                description: "Get detailed insights and analytics to optimize your stock selection strategy",
                gradient: "from-blue-400 to-cyan-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Platform",
                description: "Bank-level security with encrypted transactions and protected user data",
                gradient: "from-green-400 to-emerald-500"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Trades",
                description: "Make lightning-fast team changes during trading hours with zero delays",
                gradient: "from-yellow-400 to-red-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Team",
                description: "Select 11 stocks from different sectors to build your dream portfolio team",
                icon: <Users className="w-12 h-12" />
              },
              {
                step: "02",
                title: "Join a League",
                description: "Enter public leagues or create private ones with friends and colleagues",
                icon: <Trophy className="w-12 h-12" />
              },
              {
                step: "03",
                title: "Win Prizes",
                description: "Compete based on real stock performance and earn rewards for top rankings",
                icon: <Star className="w-12 h-12" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-400 to-blue-500 text-black text-sm font-bold px-3 py-1 rounded-full">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed max-w-sm mx-auto">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full">
                    <ChevronRight className="w-8 h-8 text-purple-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              What Players Say
            </h2>
            <p className="text-lg sm:text-xl text-slate-300">
              Join thousands of satisfied players already winning with SPL
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Day Trader",
                rating: 5,
                text: "SPL combines my love for trading with fantasy sports. I've won over $2,000 in my first month!",
                avatar: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              },
              {
                name: "Marcus Rodriguez",
                role: "Investment Analyst",
                rating: 5,
                text: "The real-time data and analytics features are incredible. It's like having a Bloomberg terminal for fantasy sports.",
                avatar: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              },
              {
                name: "Emily Taylor",
                role: "Finance Student",
                rating: 5,
                text: "Perfect way to learn about stocks while having fun. The educational aspect is amazing!",
                avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 transition-all duration-300 hover:bg-white/20"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Build Your
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-blue-200 bg-clip-text text-transparent">
              Stock Dream Team?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players competing for real prizes in the most exciting fantasy platform ever created.
          </p>
          <button
            onClick={handleGetStarted}
            className="group bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-semibold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto"
          >
            {user ? 'Go to Dashboard' : 'Start Playing Now - It\'s Free!'}
            <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                SPL
              </h3>
              <p className="text-slate-400 mb-4">
                The future of fantasy sports meets stock market investing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leagues</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leaderboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rules</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Responsible Gaming</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Stock Premier League. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;