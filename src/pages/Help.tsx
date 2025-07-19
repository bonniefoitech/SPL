import React, { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Book, 
  Video, 
  Users, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Send,
  FileText,
  Zap,
  Shield,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  ExternalLink,
  Filter,
  Tag,
  Bookmark
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  helpful: number
}

interface SupportTicket {
  id: string
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  created_at: Date
  updated_at: Date
}

const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create my first team?',
      answer: 'To create your first team, go to the "Create Team" page, select 11 stocks with different roles (Captain, Vice-Captain, All-rounder, etc.), and ensure your total budget stays within ₹100 crores. Each role has specific multipliers that affect your scoring.',
      category: 'getting-started',
      tags: ['team', 'creation', 'budget', 'roles'],
      helpful: 45
    },
    {
      id: '2',
      question: 'How are points calculated in contests?',
      answer: 'Points are calculated based on stock performance with role multipliers. Base points (100) + performance multiplier (10x stock change %) × role multiplier. Captain gets 2.5x, Vice-Captain 2x, All-rounder 2.25x, etc. Volume bonuses and sector leader bonuses also apply.',
      category: 'scoring',
      tags: ['points', 'scoring', 'multipliers', 'performance'],
      helpful: 38
    },
    {
      id: '3',
      question: 'How do I add money to my wallet?',
      answer: 'Click on "Add Money" in your wallet, enter the amount (minimum ₹10), select your payment method (UPI, Card, NetBanking), and complete the payment. Money is added instantly to your wallet.',
      category: 'payments',
      tags: ['wallet', 'payment', 'deposit', 'money'],
      helpful: 52
    },
    {
      id: '4',
      question: 'What happens if a contest is cancelled?',
      answer: 'If a contest is cancelled, all entry fees are automatically refunded to participants\' wallets within 24 hours. You\'ll receive a notification about the cancellation and refund.',
      category: 'contests',
      tags: ['cancellation', 'refund', 'contest'],
      helpful: 29
    },
    {
      id: '5',
      question: 'How do I withdraw my winnings?',
      answer: 'Go to your wallet, click "Withdraw", enter the amount (minimum ₹100), select your bank account, and submit. Withdrawals are processed within 1-3 business days.',
      category: 'payments',
      tags: ['withdrawal', 'winnings', 'bank', 'payout'],
      helpful: 41
    }
  ]

  const categories = [
    { id: 'all', name: 'All Categories', icon: Book },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'scoring', name: 'Scoring & Rules', icon: Star },
    { id: 'payments', name: 'Payments & Wallet', icon: Shield },
    { id: 'contests', name: 'Contests', icon: Users },
    { id: 'general', name: 'General Questions', icon: AlertCircle }
  ]

  const videoTutorials = [
    {
      id: '1',
      title: 'Getting Started with SPL',
      description: 'Learn the basics of creating teams and joining contests',
      duration: '5:30',
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      category: 'Beginner'
    },
    {
      id: '2',
      title: 'Advanced Team Building Strategies',
      description: 'Master the art of selecting winning stock combinations',
      duration: '8:45',
      thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      category: 'Advanced'
    },
    {
      id: '3',
      title: 'Understanding the Scoring System',
      description: 'Deep dive into how points are calculated',
      duration: '6:20',
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      category: 'Rules'
    }
  ]

  const knowledgeBaseArticles = [
    {
      id: '1',
      title: 'Complete Guide to Stock Roles',
      excerpt: 'Understanding Captain, Vice-Captain, All-rounder and other roles',
      category: 'Rules',
      readTime: '5 min',
      updated: '2 days ago'
    },
    {
      id: '2',
      title: 'Payment Security and Safety',
      excerpt: 'How we protect your financial information and transactions',
      category: 'Security',
      readTime: '3 min',
      updated: '1 week ago'
    },
    {
      id: '3',
      title: 'Contest Types Explained',
      excerpt: 'Head-to-head, tournaments, and mega contests breakdown',
      category: 'Contests',
      readTime: '4 min',
      updated: '3 days ago'
    }
  ]

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Support ticket created successfully! We\'ll get back to you soon.')
      setShowContactForm(false)
      setContactForm({
        name: '',
        email: '',
        category: 'general',
        subject: '',
        message: '',
        priority: 'medium'
      })
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
    { id: 'contact', name: 'Contact Support', icon: MessageCircle },
    { id: 'tutorials', name: 'Video Tutorials', icon: Video },
    { id: 'knowledge', name: 'Knowledge Base', icon: Book },
    { id: 'community', name: 'Community', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Get help with SPL, find answers to common questions, and connect with our support team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-400 to-blue-500 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                <p className="text-slate-400 text-sm">Get instant help</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">Chat with our support team for immediate assistance</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Call Support</h3>
                <p className="text-slate-400 text-sm">+91 1800-123-4567</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">Available 24/7 for urgent issues</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email Support</h3>
                <p className="text-slate-400 text-sm">support@spl.com</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">Response within 24 hours</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          <div className="border-b border-white/20">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b-2 border-purple-400'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* FAQ Section */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id} className="bg-slate-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {category.name}
                      </button>
                    )
                  })}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                              {categories.find(c => c.id === faq.category)?.name}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {faq.helpful} people found this helpful
                            </span>
                          </div>
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-slate-300 leading-relaxed mb-4">{faq.answer}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                {faq.tags.map(tag => (
                                  <span key={tag} className="text-xs px-2 py-1 bg-white/10 text-slate-400 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors duration-300">
                                  👍 Helpful
                                </button>
                                <button className="text-red-400 hover:text-red-300 text-sm transition-colors duration-300">
                                  👎 Not helpful
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No FAQs found</h3>
                    <p className="text-slate-400 text-sm">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Support */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Contact Our Support Team</h2>
                  <p className="text-slate-300">We're here to help! Choose how you'd like to get in touch.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Contact Methods */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-400 to-blue-500">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Live Chat</h4>
                          <p className="text-slate-400 text-sm">Average response time: 2 minutes</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Phone Support</h4>
                          <p className="text-slate-400 text-sm">+91 1800-123-4567 (24/7)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Email Support</h4>
                          <p className="text-slate-400 text-sm">support@spl.com</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Send us a Message</h3>
                    
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                          <input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                          <select
                            value={contactForm.category}
                            onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          >
                            <option value="general" className="bg-slate-800">General Inquiry</option>
                            <option value="technical" className="bg-slate-800">Technical Issue</option>
                            <option value="payment" className="bg-slate-800">Payment Issue</option>
                            <option value="contest" className="bg-slate-800">Contest Related</option>
                            <option value="account" className="bg-slate-800">Account Issue</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                          <select
                            value={contactForm.priority}
                            onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          >
                            <option value="low" className="bg-slate-800">Low</option>
                            <option value="medium" className="bg-slate-800">Medium</option>
                            <option value="high" className="bg-slate-800">High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                        <textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                        {loading ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Video Tutorials */}
            {activeTab === 'tutorials' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Video Tutorials</h2>
                  <p className="text-slate-300">Learn SPL with our step-by-step video guides</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials.map((video, index) => (
                    <div
                      key={video.id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 group animate-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </button>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-sm">
                          {video.duration}
                        </div>
                        <div className="absolute bottom-4 left-4 bg-purple-600 px-2 py-1 rounded text-white text-xs">
                          {video.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                          {video.title}
                        </h3>
                        <p className="text-slate-400 text-sm">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Base */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Knowledge Base</h2>
                  <p className="text-slate-300">Comprehensive guides and documentation</p>
                </div>

                <div className="space-y-4">
                  {knowledgeBaseArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                              {article.title}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                              {article.category}
                            </span>
                          </div>
                          <p className="text-slate-400 mb-4">{article.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readTime}
                            </span>
                            <span>Updated {article.updated}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                            <Bookmark className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Community & Forums</h2>
                  <p className="text-slate-300">Connect with other SPL players and share strategies</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-500">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Discord Community</h3>
                        <p className="text-slate-400 text-sm">12,450 members</p>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">
                      Join our Discord server for real-time discussions, strategy sharing, and community events.
                    </p>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                      Join Discord
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Official Forum</h3>
                        <p className="text-slate-400 text-sm">8,230 active users</p>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">
                      Participate in detailed discussions, ask questions, and get help from experienced players.
                    </p>
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                      Visit Forum
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-6 h-6 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Community Guidelines</h3>
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Be respectful and helpful to other members</li>
                    <li>• Share strategies and tips constructively</li>
                    <li>• No spam or promotional content</li>
                    <li>• Keep discussions relevant to SPL</li>
                    <li>• Report any issues to moderators</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help