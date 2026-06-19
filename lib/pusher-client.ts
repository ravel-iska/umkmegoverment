import Pusher from 'pusher-js';

// Client instance (only initialized on browser)
export const pusherClient = typeof window !== 'undefined' 
  ? new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
    })
  : null as any;
