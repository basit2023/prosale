import React from 'react';
import apiService from '@/utils/apiService';
// import { networkInterfaces } from 'os'
// const getNetworkAddresses = (familyType) => {
  //   const nets = networkInterfaces();
  //   const results = Object.create(null);
  
  //   for (const name of Object.keys(nets)) {
  //     for (const net of nets[name]) {
  //       if (net.family === familyType && !net.internal) {
  //         if (!results[name]) {
  //           results[name] = [];
  //         }
  //         results[name].push(net.address);
  //       }
  //     }
  //   }
  //   return results;
  // };
  
  // Function to get current timestamp
  const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
  
  export const logs=async function logs({ user, desc }:any) {
   
    // Log entry schema definition
    const payload = {
      log_type: 'Edit',
      log_descp: `${user}: ${desc}`,
      user: user,
      dt: getCurrentTimestamp(),
      ipAddress: '',
      macAddress: '',
    };
  
    try {
      await apiService.post('/logs', payload);
      // You might want to handle success or do something else here
    } catch (error) {
      console.error('Error posting log:', error);
      // Handle the error appropriately
    }
  }
  
  
  
  export const logsCreate=async function logsCreate({ user, desc }:any) {
   
    // Log entry schema definition
    const payload = {
      log_type: 'Create',
      log_descp: `${user}: ${desc}`,
      user: user,
      dt: getCurrentTimestamp(),
      ipAddress: '',
      macAddress: '',
    };
  
    try {
      await apiService.post('/logs', payload);
      // You might want to handle success or do something else here
    } catch (error) {
      console.error('Error posting log:', error);
      // Handle the error appropriately
    }
  }
  
  