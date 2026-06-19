const Pusher = require('pusher');

// Server instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'mock_id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key',
  secret: process.env.PUSHER_SECRET || 'mock_secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
  useTLS: true,
});
