import { Subtitles } from "lucide-react";

export const SESSION_ID = 'guide_' + Math.random().toString(36).substring(2, 9);

export const QUICK_PROMPTS = {
  '🎓 Academics': [
    'Tell me about the nursing program',
    'What programs does the business college offer?',
    'Tell me about the Criminal Justice program',
    'What is the ACEP program?',
    'What makes COHST unique?',
    'Tell me about the Computer and Information Sciences program',
    'What is the Psychology major like?',
    'Tell me about the Theatre program',
  ],
  '🗺️ Tour Route': [
    'What are the required stops on the standard tour route?',
    'Where do I take a nursing student?',
    'Where do I take a pre-law student?',
    'Where do I take a science student?',
    'How long should a standard tour be?',
    'What do I do if I need a tour alternate?',
    'Where is Career Services located?',
  ],
  '🏆 Clubs & Life': [
    'What honor societies does NU have?',
    'What club sports are available?',
    'Does NU have Greek life?',
    'What clubs exist for business students?',
    'What sociocultural clubs does NU have?',
    'What clubs are available for nursing students?',
    'What academic clubs does NU have?',
  ],
  '💰 Scholarships & Aid': [
    'What is the Brennan Scholars program?',
    'What is the Eagle Experience scholarship?',
    'What is the Level Tuition Plan?',
    'What is Work Study?',
    'What is the Vincentian Scholars program?',
    'What is NUSTEP?',
    'What scholarships does NU offer?',
  ],
  '📞 Contacts & Operations': [
    "What is Sara's phone number?",
    'Who do I contact for graduate programs?',
    'How do I put the phones on cover?',
    'What is the dress code for tours?',
    'What is the Follow Up and Follow Through sheet?',
    'What is the dress code for events?',
    'How do I input inquiry cards?',
  ],
};

// category cards

export const CATEGORY_CARDS = [
    {
    id: 'academics',
    icon: '🎓',
    title: 'Academics',
    subtitle: 'Programs, Majors, Colleges & Search',
    gradient: 'linear-gradient(145deg, #1a0533 0%, #3b0764 60%, #4c1d95 100%)',
    border: 'rgba(124, 58, 237, 0.4)',
    question: 'What colleges and programs does Niagara University offer?',
},

{
    id: 'tour',
    icon: '🗺️',
    title: 'Tour Route',
    subtitle: 'Buildings, stops & guide protocols',
    gradient: 'linear-gradient(145deg, #0a1628 0%, #1e3a5f 60%, #1d4ed8 100%)',
    border: 'rgba(29, 78, 216, 0.4)',
    question: 'What are the required stops on the standard tour route?',
},

{
    id: 'clubs',
    icon: '🏆',
    title: 'Clubs & Life',
    subtitle: 'Organizations, sports & campus culture',
    gradient: 'linear-gradient(145deg, #1a0e00 0%, #3d1a00 60%, #92400e 100%)',
    border: 'rgba(217, 119, 6, 0.4)',
    question: 'What clubs and organizations does NU have?',
  },
{
    id: 'scholarships',
    icon: '💰',
    title: 'Scholarships & Aid',
    subtitle: 'Merit awards & financial information',
    gradient: 'linear-gradient(145deg, #0a1a0a 0%, #1a2e1a 60%, #14532d 100%)',
    border: 'rgba(22, 163, 74, 0.4)',
    question: 'What scholarships does Niagara University offer?',
},
];

export const STARTER_QUESTIONS = [
  {
    icon: '🎓',
    text: 'I have a tour in 10 minutes — what should I know about the nursing program?',
  },
  {
    icon: '🗺️',
    text: 'What buildings are required stops on the standard tour route?',
  },
  {
    icon: '💰',
    text: 'What scholarships can I tell families about?',
  },
  {
    icon: '📋',
    text: 'What is the dress code for tours and events?',
  },
];