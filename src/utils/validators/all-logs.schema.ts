import { z } from 'zod';
import { networkInterfaces } from 'os';

// Function to get IP and MAC addresses
const getNetworkAddresses = (familyType) => {
  const nets = networkInterfaces();
  const results = Object.create(null);

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === familyType && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  return results;
};

// Function to get current timestamp
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

// Get IP and MAC addresses
const ipAddress = getNetworkAddresses('IPv4').WiFi[0];
const macAddress = getNetworkAddresses('IPv4').WiFi[0];

// Log entry schema definition
export const logEntrySchema = z.object({
  id: z.string(),
  log_type: z.string(),
  log_descp: z.string(),
  user: z.string(),
  dt: z.string(), // Using z.string() for timestamp
  ipAddress: z.string().refine(ip => ip === ipAddress, { message: 'Invalid IP address' }),
  macAddress: z.string().refine(mac => mac === macAddress, { message: 'Invalid MAC address' }),
});

export type LogEntryType = z.infer<typeof logEntrySchema>;

// Example of creating a log entry with the current timestamp
export const defaultValues: LogEntryType = {
  id: '',
  log_type: '',
  log_descp: 'Log description',
  user: 'user',
  dt: getCurrentTimestamp(),
  ipAddress: ipAddress,
  macAddress: macAddress,
};
