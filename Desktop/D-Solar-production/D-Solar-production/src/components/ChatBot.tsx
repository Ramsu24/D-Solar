'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, BookOpen, ChevronRight, Maximize, Minimize, ChevronDown, HelpCircle, Package, Calendar as CalendarIcon, Clock, Mail, Phone, User } from 'lucide-react';
import { Message } from '@/types/chat';
import './chatbot.css'; // Import the CSS for typing animation
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppointmentFormData, AvailableTimeSlot } from '@/types/appointment';
// Import the package data
import { faqData } from '@/data/faqData';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { generateToken, createTokenExpiration } from '@/utils/tokens';
import { sendAppointmentConfirmationEmail } from '@/utils/emailUtils';

// Common questions that users can click on
const COMMON_QUESTIONS = [
  'How much money will I save with Solar?',
  'Do you have installment plans?',
  'How much is a solar system?',
  'What\'s the difference between On-Grid and Hybrid System?',
  'Will solar panels work during cloudy days?',
  'What happens during a power outage?',
  'How long does it take to install?',
  'Do I need a battery for my system?',
  'I want to book an appointment' // Add appointment booking to common questions
];

// Package types for quick selection (will be populated dynamically)
const PACKAGE_TYPES = [
  { name: 'Grid-Tied Systems (No Battery)', id: 'ongrid' },
  { name: 'Hybrid Systems (5.12kWh Battery)', id: 'hybrid-small' },
  { name: 'Hybrid Systems (10.24kWh Battery)', id: 'hybrid-large' }
];

// Function to fetch FAQs from MongoDB
const fetchFAQs = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/admin/faqs');
    
    if (!response.ok) {
      console.error(`Failed to fetch FAQs: ${response.status}`);
      return COMMON_QUESTIONS; // Fallback to hardcoded questions if fetch fails
    }
    
    const faqs = await response.json();
    // Extract just the questions from the FAQ data
    // Make sure to include our appointment booking question
    const questions = faqs.map((faq: any) => faq.question);
    if (!questions.some((q: string) => q.toLowerCase().includes('appointment'))) {
      questions.push('I want to book an appointment');
    }
    return questions;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return COMMON_QUESTIONS; // Fallback to hardcoded questions if fetch fails
  }
};

// Instead of static packageInfoMap and PACKAGE_CODES, we'll load them dynamically
interface PackageData {
  code: string;
  name: string;
  description: string;
  type: string;
  wattage: number;
  suitableFor: string;
  financingPrice: number;
  srpPrice: number;
  cashPrice: number;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: '👋 Hi! How can I help you with solar energy today?'
};

// Typing animation configuration
const TYPING_SPEED = {
  minWordsPerMinute: 120, // Minimum words per minute
  maxWordsPerMinute: 200, // Maximum words per minute
  minDelayBetweenChunks: 10, // Minimum ms delay between characters
  maxDelayBetweenChunks: 20, // Maximum ms delay between characters
  chunkSize: 3, // Characters to reveal at once (simulates faster typing)
  variability: 0.2, // Random variability factor to make typing seem more human
};

// Function to fetch package info from the API
const fetchPackageInfo = async (packageCode: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/admin/packages/${packageCode}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch package ${packageCode}: ${response.status}`);
      return null;
    }
    
    const packageData = await response.json();
    
    // Format the package information in markdown
    return `**${packageData.name} (${packageData.wattage.toLocaleString()} Watts)**
- ${packageData.suitableFor}
- **Financing (VAT-Inc):** ₱${packageData.financingPrice.toLocaleString()}.00
- **SRP (VAT-Ex):** ₱${packageData.srpPrice.toLocaleString()}.00
- **Cash (VAT-Ex):** ₱${packageData.cashPrice.toLocaleString()}.00

${packageData.description}

_Note: Prices are for Metro Manila installation only. Additional transport costs apply for areas outside Metro Manila._`;
  } catch (error) {
    console.error("Error fetching package info:", error);
    return null;
  }
};

// Function to fetch all packages from MongoDB
const fetchAllPackages = async (): Promise<PackageData[]> => {
  try {
    const response = await fetch('/api/admin/packages');
    
    if (!response.ok) {
      console.error(`Failed to fetch packages: ${response.status}`);
      return [];
    }
    
    const packages = await response.json();
    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true); // Control whether to show suggestions
  const [isFullScreen, setIsFullScreen] = useState(false); // Add state for full-screen mode
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false); // Track if questions dropdown is expanded
  const [hasShownPopup, setHasShownPopup] = useState(false); // Track if popup has been shown
  const [isPopupClosing, setIsPopupClosing] = useState(false); // Track if popup is in closing animation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showPackageButtons, setShowPackageButtons] = useState<boolean>(false);
  const [selectedPackageType, setSelectedPackageType] = useState<string | null>(null);
  const [isWaitingForPackageSelection, setIsWaitingForPackageSelection] = useState<boolean>(false);
  const [packagesCache, setPackagesCache] = useState<Record<string, string>>({});
  
  // New state for dynamic package data
  const [packageTypes, setPackageTypes] = useState(PACKAGE_TYPES);
  const [packageCodes, setPackageCodes] = useState<Record<string, string[]>>({
    'ongrid': [],
    'hybrid-small': [],
    'hybrid-large': []
  });
  const [allPackages, setAllPackages] = useState<PackageData[]>([]);
  const [packagesLoaded, setPackagesLoaded] = useState(false);
  const [commonQuestions, setCommonQuestions] = useState<string[]>(COMMON_QUESTIONS);

  // New state for appointment booking form
  const [isBookingAppointment, setIsBookingAppointment] = useState<boolean>(false);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    name: '',
    email: '',
    phone: '',
    date: null,
    time: '',
    message: ''
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  // Load packages data when the component mounts
  useEffect(() => {
    const loadPackages = async () => {
      const packages = await fetchAllPackages();
      setAllPackages(packages);
      
      if (packages.length > 0) {
        // For OnGrid packages, use the type field directly
        const ongridPackages = packages.filter(pkg => pkg.type === 'ongrid').map(pkg => pkg.code);
        
        // Initialize arrays for categorized hybrid packages
        let hybridSmallPackages: string[] = [];
        let hybridLargePackages: string[] = [];
        
        // Process hybrid packages
        packages.forEach(pkg => {
          // Skip onGrid packages
          if (pkg.type === 'ongrid') return;
          
          // For packages already categorized in the database
          if (pkg.type === 'hybrid-small') {
            hybridSmallPackages.push(pkg.code);
            return;
          }
          
          if (pkg.type === 'hybrid-large') {
            hybridLargePackages.push(pkg.code);
            return;
          }
          
          // For packages with just "hybrid" type, we need to determine the battery capacity
          if (pkg.type === 'hybrid') {
            // Check code for battery capacity indication
            // Pattern: HYB-XXK5-PX for 5.12kWh batteries and HYB-XXK10-PX for 10.24kWh batteries
            if (pkg.code.includes('K5-') || pkg.name.includes('5.12kWh') || pkg.description.includes('5.12kWh')) {
              hybridSmallPackages.push(pkg.code);
            } else if (pkg.code.includes('K10-') || pkg.name.includes('10.24kWh') || pkg.description.includes('10.24kWh')) {
              hybridLargePackages.push(pkg.code);
            } else {
              // If we can't determine from code, use name and description patterns
              const fullText = `${pkg.name} ${pkg.description}`.toLowerCase();
              if (fullText.includes('5.12') || fullText.includes('5k') || fullText.includes('5 k')) {
                hybridSmallPackages.push(pkg.code);
              } else if (fullText.includes('10.24') || fullText.includes('10k') || fullText.includes('10 k')) {
                hybridLargePackages.push(pkg.code);
              } else {
                // Default to small if we can't determine
                console.warn(`Could not determine battery size for package ${pkg.code}, defaulting to small`);
                hybridSmallPackages.push(pkg.code);
              }
            }
          }
        });
        
        // Update package codes
        setPackageCodes({
          'ongrid': ongridPackages,
          'hybrid-small': hybridSmallPackages,
          'hybrid-large': hybridLargePackages
        });
        
        // Pre-populate the packages cache
        const cache: Record<string, string> = {};
        for (const pkg of packages) {
          cache[pkg.code] = `**${pkg.name} (${pkg.wattage.toLocaleString()} Watts)**
- ${pkg.suitableFor}
- **Financing (VAT-Inc):** ₱${pkg.financingPrice.toLocaleString()}.00
- **SRP (VAT-Ex):** ₱${pkg.srpPrice.toLocaleString()}.00
- **Cash (VAT-Ex):** ₱${pkg.cashPrice.toLocaleString()}.00

${pkg.description}

_Note: Prices are for Metro Manila installation only. Additional transport costs apply for areas outside Metro Manila._`;
        }
        
        setPackagesCache(cache);
        setPackagesLoaded(true);
      }
    };
    
    loadPackages();
    
    // Load FAQs from MongoDB
    const loadFAQs = async () => {
      const faqs = await fetchFAQs();
      setCommonQuestions(faqs);
    };
    
    loadFAQs();
  }, []);

  // Effect to mark popup as shown after page loads
  useEffect(() => {
    // Give time for the popup to be visible
    const popupTimer = setTimeout(() => {
      closePopup();
    }, 10000); // Start closing popup after 10 seconds
    
    return () => clearTimeout(popupTimer);
  }, []);

  // Function to handle popup closing with animation
  const closePopup = () => {
    // Start the closing animation
    setIsPopupClosing(true);
    
    // After animation completes, mark popup as shown
    setTimeout(() => {
      setHasShownPopup(true);
      setIsPopupClosing(false);
    }, 500); // Match this with the CSS animation duration
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedContent]);

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Effect for simulating typing
  useEffect(() => {
    if (!typingMessage) return;

    const content = typingMessage.content;
    if (displayedContent.length >= content.length) {
      // Typing animation complete
      setMessages(prev => [...prev, typingMessage]);
      setTypingMessage(null);
      setDisplayedContent('');
      return;
    }

    // Calculate a natural typing delay based on content length
    const totalWordCount = content.split(/\s+/).length;
    const totalChars = content.length;
    
    // Calculate average typing speed with some randomness
    const randomFactor = 1 + (Math.random() * TYPING_SPEED.variability * 2 - TYPING_SPEED.variability);
    const wordsPerMinute = TYPING_SPEED.minWordsPerMinute + 
      Math.random() * (TYPING_SPEED.maxWordsPerMinute - TYPING_SPEED.minWordsPerMinute);
    
    // Calculate how many characters to reveal in this step
    const nextChunkSize = Math.min(TYPING_SPEED.chunkSize, content.length - displayedContent.length);
    const nextContent = content.substring(0, displayedContent.length + nextChunkSize);
    
    // Calculate variable delay between chunks for more human-like typing
    let delay = TYPING_SPEED.minDelayBetweenChunks + 
      Math.random() * (TYPING_SPEED.maxDelayBetweenChunks - TYPING_SPEED.minDelayBetweenChunks);
    
    // Adjust delay based on punctuation and emoji (pause longer)
    const lastChar = displayedContent[displayedContent.length - 1];
    if (['.', '!', '?', ',', ':', ';', '😊', '👋', '🌞', '💰', '⚡'].includes(lastChar)) {
      delay *= 3; // Pause longer after punctuation or emoji
    }
    
    // Apply the random factor
    delay *= randomFactor;
    
    // Set timeout for next character reveal
    typingTimeoutRef.current = setTimeout(() => {
      setDisplayedContent(nextContent);
    }, delay);
    
  }, [typingMessage, displayedContent]);

  // Add an effect to handle when in fullscreen mode
  useEffect(() => {
    // When in fullscreen mode, we want to ensure the chat is above everything else
    // and the body doesn't scroll
    if (isFullScreen && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen, isOpen]);

  const handleChatToggle = () => {
    setIsOpen(!isOpen);
    // When opening the chat, close popup with animation
    if (!isOpen && !hasShownPopup) {
      closePopup();
    }
  };

  // Handle showing package options
  const handlePackagesButtonClick = () => {
    // Prevent showing packages if bot is already typing or loading
    if (isLoading || typingMessage !== null) {
      return;
    }
    
    setShowPackageButtons(true);
    setIsWaitingForPackageSelection(true);
    
    // Keep the questions section collapsed instead of expanded
    setIsQuestionsExpanded(false);
    
    // Add a response asking the user to select a package
    const botMessage: Message = {
      role: 'assistant',
      content: 'Please select a package type below to get detailed pricing information. This will help me provide you with the most accurate information for your needs.'
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    // Scroll after a slight delay to ensure the UI has updated
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  // Function to start the appointment booking process with form
  const startAppointmentBooking = () => {
    // Reset the appointment form and state
    setAppointmentForm({
      name: '',
      email: '',
      phone: '',
      date: null,
      time: '',
      message: ''
    });
    setIsBookingAppointment(true);
    setShowAppointmentForm(true);
    setShowSuggestions(false);
    
    // Add a message from the chatbot explaining the booking process
    const botMessage: Message = {
      role: 'assistant',
      content: 'Great! Please fill out the form below to book an appointment with our solar specialists.'
    };
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: 'I want to book an appointment'
    }, botMessage]);
  };

  // Function to handle form submission
  const handleAppointmentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!appointmentForm.name || !appointmentForm.email || !appointmentForm.phone || !appointmentForm.date || !appointmentForm.time) {
      setAppointmentError('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(appointmentForm.email)) {
      setAppointmentError('Please enter a valid email address');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!phoneRegex.test(appointmentForm.phone.replace(/\s/g, ''))) {
      setAppointmentError('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format date for API
      const formattedDate = format(appointmentForm.date!, 'yyyy-MM-dd');
      
      // Generate confirmation token
      const confirmationToken = generateToken();
      
      // Create and save appointment to database using API
      const appointmentResponse = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: appointmentForm.name,
          email: appointmentForm.email,
          phone: appointmentForm.phone, 
          date: formattedDate,
          time: appointmentForm.time,
          message: appointmentForm.message,
          confirmationToken: confirmationToken
        }),
      });
      
      const appointmentResult = await appointmentResponse.json();
      
      if (!appointmentResponse.ok) {
        throw new Error(appointmentResult.error || 'Failed to create appointment');
      }
      
      // Send confirmation email using our email utility function
      const emailData = {
        to: appointmentForm.email,
        name: appointmentForm.name,
        email: appointmentForm.email,
        date: formattedDate,
        time: appointmentForm.time,
        confirmationToken: confirmationToken,
        message: appointmentForm.message || ''
      };
      
      const emailSuccess = await sendAppointmentConfirmationEmail(emailData);
      
      if (!emailSuccess) {
        console.error('Failed to send confirmation email');
      }
      
      // Reset appointment state
      setIsBookingAppointment(false);
      setShowAppointmentForm(false);
      setShowSuggestions(true);
      
      // Show success message
      setTypingMessage({
        role: 'assistant',
        content: `Thank you! Your appointment request has been submitted successfully. Please check your email (${appointmentForm.email}) for a confirmation link. You'll need to click that link to confirm your appointment.

If you don't see the email within 5 minutes, please check your spam folder. The appointment will remain pending until you confirm it via the email link.

If you have any questions, please feel free to ask me!`
      });
    } catch (error) {
      console.error('Appointment booking error:', error);
      setAppointmentError('Failed to book appointment. Please try again later.');
      
      setTypingMessage({
        role: 'assistant',
        content: 'I\'m sorry, but there was an error submitting your appointment. Please try again later or contact us directly at our office.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle date change
  const handleDateChange = async (date: Date | null) => {
    if (!date) return;
    
    setAppointmentForm(prev => ({ ...prev, date, time: '' }));
    setIsCheckingAvailability(true);
    
    try {
      // Format date for API
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Fetch time slots for the selected date from API
      const response = await fetch(`/api/appointment/available-slots?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const data = await response.json();
      
      // Set available time slots
      setAvailableTimeSlots(data.slots);
      
      // Check if there are any available slots
      const hasAvailableSlots = data.slots.some((slot: AvailableTimeSlot) => slot.available);
      
      if (!hasAvailableSlots) {
        setAppointmentError('No available time slots for the selected date. Please choose another date.');
      } else {
        setAppointmentError(null);
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      setAppointmentError('Failed to fetch available time slots. Please try again later.');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Function to close appointment form
  const closeAppointmentForm = () => {
    setShowAppointmentForm(false);
    setIsBookingAppointment(false);
    setShowSuggestions(true);
    
    // Add a message that the booking was cancelled
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Appointment booking cancelled. Is there anything else I can help you with?'
    }]);
  };

  // Modify handleQuestionClick to use new appointment booking flow
  const handleQuestionClick = (question: string) => {
    // Prevent sending a new question if bot is already typing or loading
    if (isLoading || typingMessage !== null) {
      return;
    }
    
    // Collapse the questions dropdown so it doesn't block the chat
    setIsQuestionsExpanded(false);
    
    // Special handling for booking appointment
    if (question.toLowerCase().includes('appointment') && 
        question.toLowerCase().includes('book')) {
      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: question
      }]);
      startAppointmentBooking();
      return;
    }
    
    // Set the question as the input
    setInputMessage(question);
    
    // Submit the form programmatically
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, question);
  };

  // Function to handle package type selection
  const handlePackageTypeClick = (packageTypeId: string) => {
    setSelectedPackageType(packageTypeId);
  };

  // Function to handle package code selection
  const handlePackageCodeClick = async (packageCode: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: `Tell me about the ${packageCode} package`
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    // Use cache if available, otherwise fetch
    let packageInfo = packagesCache[packageCode];
    
    if (!packageInfo) {
      // Fetch the package information from the API
      const fetchedInfo = await fetchPackageInfo(packageCode);
      
      // If fetched successfully, add to cache
      if (fetchedInfo) {
        packageInfo = fetchedInfo;
        setPackagesCache(prev => ({ ...prev, [packageCode]: fetchedInfo }));
      }
    }
    
    if (packageInfo) {
      // Create bot message with package details
      const botMessage: Message = {
        role: 'assistant',
        content: packageInfo,
        source: 'llm' // Changed from 'package' to match existing types
      };
      
      // Start typing animation after a brief delay
      setTimeout(() => {
        setIsLoading(false);
        setTypingMessage(botMessage);
        setDisplayedContent('');
      }, 800);
    } else {
      // Fallback if package not found
      const botMessage: Message = {
        role: 'assistant',
        content: `I'm sorry, I don't have detailed information about the ${packageCode} package. Please contact our sales team at +63-960-471-6968 for more information.`,
        source: 'llm' // Ensuring source is one of the allowed types
      };
      
      setTimeout(() => {
        setIsLoading(false);
        setTypingMessage(botMessage);
        setDisplayedContent('');
      }, 800);
    }
    
    // Reset package selection after clicking
    setSelectedPackageType(null);
    setShowPackageButtons(false);
    setIsWaitingForPackageSelection(false);
  };

  // Update handleSubmit to use new appointment booking flow
  const handleSubmit = async (e: React.FormEvent, selectedQuestion?: string) => {
    e.preventDefault();
    const messageToSend = selectedQuestion || inputMessage;
    if ((!messageToSend.trim() || isLoading) && !selectedQuestion) return;

    // Reset error state
    setError(null);
    
    // Ensure questions dropdown is collapsed when user chats
    setIsQuestionsExpanded(false);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: messageToSend.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Check if this is an appointment booking request
    if (messageToSend.trim().toLowerCase().includes('appointment') && 
        messageToSend.trim().toLowerCase().includes('book')) {
      startAppointmentBooking();
      return;
    }

    // If we're waiting for package selection and it's not a package selection
    if (isWaitingForPackageSelection && !selectedQuestion) {
      const botMessage: Message = {
        role: 'assistant',
        content: 'Please select one of the package options below first so I can provide you with specific pricing information.'
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
      }, 500);
      return;
    }

    // Proceed with API call if we're not waiting for package selection
    // or if this is a selected package question
    if (!isWaitingForPackageSelection || selectedQuestion) {
      setIsLoading(true);

      // Check if it's a very short query (and not from clicking a suggestion)
      const isVeryShortQuery = !selectedQuestion && messageToSend.trim().length <= 4;
      const isCommonWord = !selectedQuestion && ['what', 'how', 'why', 'where', 'when', 'who', 'which', 'will', 'can'].includes(messageToSend.trim().toLowerCase());
      
      if (isVeryShortQuery || isCommonWord) {
        // For very short queries, ask for clarification instead of calling the API
        setIsLoading(false);
        setTypingMessage({
          role: 'assistant',
          content: `Could you please provide more details about what you'd like to know${isCommonWord ? ' about ' + messageToSend : ''}? 🌞 You can also try one of the suggested questions above or ask a specific question about solar energy.`
        });
        setDisplayedContent('');
        
        // Show suggestions again to help the user, but keep the dropdown collapsed
        setShowSuggestions(true);
        setIsQuestionsExpanded(false); // Ensure dropdown stays collapsed
        return;
      }

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            history: messages.slice(1), // Exclude the initial greeting
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        // Regular response handling (removed automatic package selection for pricing queries)
        const botMessage: Message = {
          role: 'assistant',
          content: data.message,
          source: data.source
        };
        
        // Calculate typing delay
        const wordCount = data.message.split(/\s+/).length;
        const baseTypingSpeed = 130;
        const typingTimeMs = Math.min(
          (wordCount / baseTypingSpeed) * 60 * 1000,
          2000
        );
        
        setTimeout(() => {
          setIsLoading(false);
          setTypingMessage(botMessage);
          setDisplayedContent('');
        }, typingTimeMs);
      } catch (err) {
        console.error('Chat error:', err);
        setError('An error occurred. Please try again.');
        setTimeout(() => {
          setError(null);
          setIsLoading(false);
        }, 3000);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again.'
        }]);
      }
    }
  };

  // Add a function to toggle full-screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // Give a small delay to ensure the container resizes before scrolling
    setTimeout(scrollToBottom, 100);
  };

  const scrollToQuestionsTop = () => {
    const questionsContainer = document.getElementById('common-questions-list');
    if (questionsContainer) {
      questionsContainer.scrollTop = 0;
    }
  };

  const toggleQuestionsDropdown = () => {
    setIsQuestionsExpanded(!isQuestionsExpanded);
    // Give time for the animation and then handle scrolling
    if (!isQuestionsExpanded) {
      setTimeout(() => {
        scrollToQuestionsTop();
        // Then scroll chat container to show the questions section
        if (chatContainerRef.current) {
          const questionsSection = document.getElementById('common-questions-list')?.parentElement;
          if (questionsSection) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }
      }, 100);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200] xs:bottom-2 xs:right-2">
      {/* Chat toggle button with popup */}
      <div className={`relative group ${isFullScreen && isOpen ? 'hidden' : 'block'}`}>
        {/* Fixed popup message - only visible until chat opens or it's dismissed */}
        {!isOpen && (!hasShownPopup || isPopupClosing) && (
          <div className={`absolute bottom-full right-0 mb-3 chat-popup ${isPopupClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-4 py-3 rounded-lg shadow-xl whitespace-nowrap font-medium border-2 border-white relative">
              {/* Close button */}
             
              
              <div className="flex items-center">
                <span className="mr-2">✨</span>
                <span>Chat with us now!</span>
                <span className="ml-2">✨</span>
              </div>
              <div className="text-xs font-normal mt-1 opacity-90">Ask about solar packages, savings, and more!</div>
              <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-blue-600 border-r-2 border-b-2 border-white"></div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleChatToggle}
          className={`
            ${isOpen ? 'button' : 'button'} 
            hover:bg-blue-500 text-white rounded-full p-3 shadow-lg 
            transition-all duration-500 transform hover:scale-110
            ring-4 ring-white bg-gradient-to-r from-orange-500 to-blue-600
          `}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} className="animate-pulse" />}
        </button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className={`
          ${isFullScreen 
            ? 'fixed top-0 left-0 w-full h-full rounded-none z-[201] animate-scaleUp' 
            : 'absolute bottom-16 right-0 md:w-[450px] md:h-[600px] sm:w-[380px] sm:h-[550px] xs:w-[calc(100vw-1rem)] xs:max-w-[650px] xs:h-[700px] xs:right-[-8px] rounded-lg animate-slideIn'
          } 
          bg-white shadow-xl flex flex-col overflow-hidden`}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-orange-400 via-blue-500 to-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Chat with Us</h3>
              <p className="text-sm opacity-90 xs:hidden">Ask us anything about solar energy!</p>
            </div>
            
            {/* Add fullscreen toggle button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFullScreen}
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
                aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
              >
                {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              
              {/* Close button - always show on mobile */}
              <button
                onClick={handleChatToggle}
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className={`p-4 flex-1 overflow-y-auto ${isFullScreen ? 'flex flex-col' : ''}`}
            ref={chatContainerRef}
          >
            {/* Chat messages */}
            <div className="flex flex-col">
              {messages.map((message, index) => (
                <div key={index} className={`max-w-[80%] mb-4 ${message.role === 'user' ? 'ml-auto' : ''}`}>
                  <div
                    className={`p-3 rounded-lg relative ${
                      message.role === 'user'
                        ? 'bg-blue-50 text-gray-800 rounded-br-none'
                        : 'bg-orange-50 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        strong: ({children}) => <strong className="font-bold">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        h1: ({children}) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-md font-bold mb-2">{children}</h3>,
                        a: ({children, href}) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        code: ({children, className}) => 
                          className 
                            ? <code className="bg-gray-100 px-1 rounded">{children}</code>
                            : <pre className="bg-gray-100 p-2 rounded mb-2 overflow-x-auto"><code>{children}</code></pre>
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.source === 'faq' && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full flex items-center">
                        <BookOpen size={10} className="mr-0.5" />
                        <span>FAQ</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Package buttons - show after a message about packages */}
              {showPackageButtons && !selectedPackageType && (
                <div className="flex justify-center my-2">
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm w-full">
                    <p className="text-center text-sm font-medium mb-3">Select a package type:</p>
                    <div className="grid gap-3 md:grid-cols-3 grid-cols-1">
                      {packageTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handlePackageTypeClick(type.id)}
                          className="bg-white border border-blue-300 text-blue-600 px-3 py-2 rounded-md text-sm hover:bg-blue-100 transition-colors flex flex-col items-center"
                        >
                          <span className="font-medium">{type.name}</span>
                          {type.id === 'ongrid' && (
                            <span className="text-xs text-gray-500 mt-1">Lower cost, requires grid power</span>
                          )}
                          {type.id === 'hybrid-small' && (
                            <span className="text-xs text-gray-500 mt-1">Medium backup, good for essentials</span>
                          )}
                          {type.id === 'hybrid-large' && (
                            <span className="text-xs text-gray-500 mt-1">Longer backup, powers more appliances</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Package code buttons - show after selecting a package type */}
              {selectedPackageType && packageCodes[selectedPackageType] && (
                <div className="flex justify-center my-2">
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm w-full">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium">Select a package based on your monthly bill:</p>
                      <button 
                        onClick={() => setSelectedPackageType(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                      {packageCodes[selectedPackageType].map((code) => {
                        // Find the package data to display appropriate info
                        const pkg = allPackages.find(p => p.code === code);
                        return (
                          <button
                            key={code}
                            onClick={() => handlePackageCodeClick(code)}
                            className="bg-white border border-blue-300 text-blue-600 px-3 py-2 rounded-md text-sm hover:bg-blue-100 transition-colors flex flex-col items-center"
                          >
                            <span className="font-medium">{code}</span>
                            {pkg && (
                              <>
                                <span className="text-xs text-gray-500 mt-1">{pkg.wattage}W</span>
                                <span className="text-xs text-gray-500">For bills: {pkg.suitableFor}</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Typing indicator */}
              {typingMessage && (
                <div className="flex justify-start">
                  <div
                    className={`max-w-[80%] rounded-lg p-3 transform bg-gray-100 text-gray-800 relative`}
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        strong: ({children}) => <strong className="font-bold">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        h1: ({children}) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-md font-bold mb-2">{children}</h3>,
                        a: ({children, href}) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        code: ({children, className}) => 
                          className 
                            ? <code className="bg-gray-100 px-1 rounded">{children}</code>
                            : <pre className="bg-gray-100 p-2 rounded mb-2 overflow-x-auto"><code>{children}</code></pre>
                      }}
                    >
                      {displayedContent}
                    </ReactMarkdown>
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-500 animate-blink"></span>
                    
                    {/* Add FAQ badge for messages sourced from the FAQ */}
                    {typingMessage.source === 'faq' && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full flex items-center">
                        <BookOpen size={10} className="mr-0.5" />
                        <span>FAQ</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Appointment Booking Form */}
              {showAppointmentForm && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg shadow-md animate-fadeIn">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Book an Appointment</h3>
                    <button 
                      onClick={closeAppointmentForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAppointmentFormSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <User size={16} className="mr-1" /> Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={appointmentForm.name}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail size={16} className="mr-1" /> Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={appointmentForm.email}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone size={16} className="mr-1" /> Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={appointmentForm.phone}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <CalendarIcon size={16} className="mr-1" /> Appointment Date *
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={appointmentForm.date}
                          onChange={handleDateChange}
                          minDate={new Date()}
                          filterDate={(date) => {
                            // Disable weekends
                            const day = date.getDay();
                            return day !== 0 && day !== 6;
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholderText="Select a date"
                          dateFormat="MMMM d, yyyy"
                          required
                        />
                        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                          <CalendarIcon size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Clock size={16} className="mr-1" /> Appointment Time *
                      </label>
                      <select
                        id="time"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!appointmentForm.date || isCheckingAvailability}
                        required
                      >
                        <option value="">Select time slot</option>
                        {availableTimeSlots.map((slot, index) => (
                          <option key={index} value={slot.time} disabled={!slot.available}>
                            {slot.time} {!slot.available && '(Unavailable)'}
                          </option>
                        ))}
                      </select>
                      {isCheckingAvailability && (
                        <div className="text-sm text-blue-600 mt-1 flex items-center">
                          <div className="animate-spin mr-1 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          Loading available time slots...
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Message
                      </label>
                      <textarea
                        id="message"
                        value={appointmentForm.message}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional information or requirements"
                      ></textarea>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading || isCheckingAvailability}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Booking Appointment...
                          </span>
                        ) : 'Book Appointment'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {error && (
              <div className="text-center text-red-500 text-sm py-2 animate-pulse">
                {error}
              </div>
            )}
            {/* Appointment error message */}
            {appointmentError && (
              <div className="text-center text-red-500 text-sm py-2 animate-pulse">
                {appointmentError}
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 max-w-[80%] shadow-sm border border-gray-100">
                  <div className="flex flex-col">
                    <div className="flex items-center min-w-[40px] justify-center">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Show common questions section when showSuggestions is true - Moved between chat and input */}
          {showSuggestions && !showAppointmentForm && (
            <div className="px-4 pt-3 pb-4 bg-gradient-to-br from-blue-50 to-orange-50 border-t border-blue-100 animate-slideIn shadow-inner">
              <button 
                onClick={toggleQuestionsDropdown}
                className="w-full flex items-center justify-between text-md font-semibold text-blue-700 mb-3 hover:text-blue-900 transition-colors group"
                aria-expanded={isQuestionsExpanded}
                aria-controls="common-questions-list"
              >
                <div className="flex items-center">
                  <HelpCircle size={18} className="mr-2 text-orange-500" />
                  <span>Common Questions</span>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 text-orange-500 group-hover:text-orange-600 ${isQuestionsExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {isQuestionsExpanded && (
                <div id="common-questions-list" className="grid gap-2.5 animate-scaleUp px-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent">
                  {/* Add a separate button for appointment booking */}
                  <button
                    onClick={() => handleQuestionClick('I want to book an appointment')}
                    disabled={isLoading || typingMessage !== null}
                    className={`text-left text-sm py-2 px-4 border rounded-lg flex items-center group shadow-sm transition-colors ${
                      isLoading || typingMessage !== null 
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70" 
                        : "border-green-200 bg-white hover:bg-green-50 hover:border-green-300 hover:shadow-md"
                    }`}
                  >
                    <MessageCircle size={16} className={`mr-2 ${
                      isLoading || typingMessage !== null 
                        ? "text-gray-400" 
                        : "text-green-500 group-hover:scale-110 transition-transform"
                    }`} />
                    <span className={`font-medium ${
                      isLoading || typingMessage !== null 
                        ? "text-gray-500" 
                        : "text-gray-800"
                    }`}>Book an Appointment</span>
                  </button>
                  
                  {/* Add a packages button */}
                  <button
                    onClick={handlePackagesButtonClick}
                    disabled={isLoading || typingMessage !== null}
                    className={`text-left text-sm py-2 px-4 border rounded-lg flex items-center group shadow-sm transition-colors ${
                      isLoading || typingMessage !== null 
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70" 
                        : "border-blue-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <Package size={16} className={`mr-2 ${
                      isLoading || typingMessage !== null 
                        ? "text-gray-400" 
                        : "text-orange-500 group-hover:scale-110 transition-transform"
                    }`} />
                    <span className={`font-medium ${
                      isLoading || typingMessage !== null 
                        ? "text-gray-500" 
                        : "text-gray-800"
                    }`}>View Solar Packages</span>
                  </button>
                  
                  {/* Dynamic questions from MongoDB */}
                  {commonQuestions
                    .filter(q => !q.toLowerCase().includes('appointment')) // Filter out the appointment question since we have a dedicated button
                    .map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      disabled={isLoading || typingMessage !== null}
                      className={`text-left text-sm py-2 px-4 border rounded-lg flex items-center group shadow-sm transition-colors ${
                        isLoading || typingMessage !== null 
                          ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70" 
                          : "border-blue-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:shadow-md"
                      }`}
                    >
                      <ChevronRight size={16} className={`mr-2 ${
                        isLoading || typingMessage !== null 
                          ? "text-gray-400" 
                          : "text-orange-500 group-hover:translate-x-1 transition-transform"
                      }`} />
                      <span className={`${
                        isLoading || typingMessage !== null 
                          ? "text-gray-500" 
                          : "text-gray-700 group-hover:text-gray-900 transition-colors"
                      }`}>{question}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input form - Hide when showing appointment form */}
          {!showAppointmentForm && (
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading || typingMessage !== null}
                  className="button min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send size={24} />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot; 