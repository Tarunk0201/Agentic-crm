import {
  Activity,
  BadgeDollarSign,
  Phone,
  PhoneCall,
  PhoneIncoming,
} from 'lucide-react'

export const dashboardStats = [
  { id: 'spend', label: 'Voice API Spend', value: 12840, prefix: '$', suffix: '', icon: BadgeDollarSign },
  { id: 'calls', label: 'Total Calls', value: 2471, prefix: '', suffix: '', icon: Phone },
  { id: 'answered', label: 'Answered', value: 2236, prefix: '', suffix: '', icon: PhoneCall },
  { id: 'rate', label: 'Answer Rate', value: 90.48, prefix: '', suffix: '%', icon: Activity, decimals: 2 },
  { id: 'avg', label: 'Avg Duration', value: 4.2, prefix: '', suffix: 'm', icon: PhoneIncoming, decimals: 1 },
]

export const callLogs = [
  {
    id: 'c-10001',
    from: '+1 (555) 482-1192',
    to: '+1 (555) 099-4211',
    direction: 'Inbound',
    type: 'Support',
    status: 'Answered',
    date: 'May 08, 2026',
    time: '09:42 AM',
    duration: '05:16',
    mos: 4.5,
    cost: '$2.12',
  },
  {
    id: 'c-10002',
    from: '+1 (555) 672-9082',
    to: '+1 (555) 330-7701',
    direction: 'Outbound',
    type: 'Sales',
    status: 'Answered',
    date: 'May 08, 2026',
    time: '10:03 AM',
    duration: '03:22',
    mos: 4.1,
    cost: '$1.44',
  },
  {
    id: 'c-10003',
    from: '+1 (555) 996-4452',
    to: '+1 (555) 102-9982',
    direction: 'Inbound',
    type: 'Support',
    status: 'Missed',
    date: 'May 08, 2026',
    time: '10:17 AM',
    duration: '00:00',
    mos: 3.6,
    cost: '$0.00',
  },
  {
    id: 'c-10004',
    from: '+1 (555) 202-1190',
    to: '+1 (555) 440-2218',
    direction: 'Outbound',
    type: 'Follow-up',
    status: 'Answered',
    date: 'May 08, 2026',
    time: '11:29 AM',
    duration: '07:03',
    mos: 4.8,
    cost: '$3.01',
  },
]

export const callTimeline = [
  { key: 'initiated', label: 'Initiated', value: '09:42:12 AM' },
  { key: 'ring', label: 'Ring Start', value: '09:42:18 AM' },
  { key: 'answered', label: 'Answered', value: '09:42:26 AM' },
  { key: 'ended', label: 'Ended', value: '09:47:42 AM' },
]

export const transcriptMessages = [
  { id: 1, sender: 'agent', text: 'Hello, thank you for calling support.', time: '09:42:31' },
  { id: 2, sender: 'user', text: 'I need help with my order.', time: '09:42:40' },
  { id: 3, sender: 'agent', text: 'Sure, can you share your order ID?', time: '09:42:55' },
  { id: 4, sender: 'user', text: 'Yes, it is #45321.', time: '09:43:03' },
]

export const recordingMeta = {
  url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
  filename: 'call-c-10001.wav',
  duration: '05:16',
}

export const contactsData = [
  { id: 1, name: 'Anuj Jhariya', phone: '+91 98765 12345', email: 'anuj.jhariya@crmflow.in', business: 'Apex Realty', date: '12 Jan 2026', tags: ['Hot Lead', 'WhatsApp'], avatar: 'AJ' },
  { id: 2, name: 'Bandana Sharma', phone: '+91 98111 22334', email: 'bandana.sharma@nexahub.in', business: 'Nexa Hub', date: '15 Jan 2026', tags: ['VIP'], avatar: 'BS' },
  { id: 3, name: 'Nalini Patel', phone: '+91 98980 90011', email: 'nalini.patel@sunrisecare.in', business: 'Sunrise Care', date: '19 Jan 2026', tags: ['Follow Up'], avatar: 'NP' },
  { id: 4, name: 'Heena Khan', phone: '+91 99220 15551', email: 'heena.khan@blueorbit.in', business: 'Blue Orbit', date: '23 Jan 2026', tags: ['Converted'], avatar: 'HK' },
  { id: 5, name: 'Raghav Tiwari', phone: '+91 99770 11223', email: 'raghav.tiwari@finaxis.in', business: 'Finaxis', date: '01 Feb 2026', tags: ['New'], avatar: 'RT' },
  { id: 6, name: 'Priyanshi Verma', phone: '+91 98720 33445', email: 'priyanshi.verma@northpeak.in', business: 'North Peak', date: '05 Feb 2026', tags: ['Hot Lead'], avatar: 'PV' },
  { id: 7, name: 'Mohit Bansal', phone: '+91 99341 00121', email: 'mohit.bansal@urbancrest.in', business: 'Urban Crest', date: '09 Feb 2026', tags: ['Email Sent'], avatar: 'MB' },
]

export const bulkActionsData = [
  {
    id: 1,
    label: 'AI Calling Batch',
    name: 'Mumbai AI Outreach',
    subtext: 'Workflow sequence',
    operation: 'Workflow',
    status: 'Complete',
    user: 'Rakhi Binjwa',
    userEmail: 'rakhi@crm.com',
    created: 'May 6, 2026 06:20 PM',
    completed: 'May 6, 2026 06:20 PM'
  },
  {
    id: 2,
    label: 'Lead Workflow',
    name: 'Insurance Lead Automation',
    subtext: 'Workflow sequence',
    operation: 'Workflow',
    status: 'Running',
    user: 'Sumit Chaudhary',
    userEmail: 'sumit@crm.com',
    created: 'Apr 18, 2026 01:58 PM',
    completed: '-'
  },
  {
    id: 3,
    label: 'Webinar Campaign',
    name: 'Webinar Followup Sequence',
    subtext: 'Campaign sequence',
    operation: 'Campaign',
    status: 'Scheduled',
    user: 'Admin',
    userEmail: 'admin@crm.com',
    created: 'Apr 20, 2026 10:00 AM',
    completed: '-'
  },
  {
    id: 4,
    label: 'SMS Automation',
    name: 'EMI Reminder Blast',
    subtext: 'Campaign sequence',
    operation: 'Campaign',
    status: 'Failed',
    user: 'Nitin Verma',
    userEmail: 'nitin@crm.com',
    created: 'Apr 25, 2026 11:40 AM',
    completed: '-'
  },
]
