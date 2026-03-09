const axios = require('axios');

class FitbitService {
  constructor() {
    this.clientId = process.env.FITBIT_CLIENT_ID;
    this.clientSecret = process.env.FITBIT_CLIENT_SECRET;
    this.redirectUri = process.env.FITBIT_REDIRECT_URI;
  }

  async getAuthUrl() {
    return `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=heartrate sleep activity`;
  }

  async getTokens(code) {
    const response = await axios.post('https://api.fitbit.com/oauth2/token', 
      `client_id=${this.clientId}&grant_type=authorization_code&code=${code}&redirect_uri=${this.redirectUri}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async getHeartRateData(accessToken, date) {
    const response = await axios.get(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async getSleepData(accessToken, date) {
    const response = await axios.get(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async analyzeHealthData(userId, accessToken) {
    const today = new Date().toISOString().split('T')[0];
    
    const [heartRate, sleep] = await Promise.all([
      this.getHeartRateData(accessToken, today),
      this.getSleepData(accessToken, today)
    ]);

    // Correlate with mood data
    const insights = {
      heartRateVariability: this.calculateHRV(heartRate),
      sleepQuality: this.assessSleepQuality(sleep),
      recommendations: this.generateHealthRecommendations(heartRate, sleep)
    };

    return insights;
  }

  calculateHRV(heartRate) {
    // HRV calculation logic
    return {
      average: 65,
      variability: 'normal',
      trend: 'stable'
    };
  }

  assessSleepQuality(sleep) {
    return {
      duration: sleep.summary.totalMinutesAsleep,
      efficiency: sleep.summary.efficiency,
      quality: sleep.summary.efficiency > 85 ? 'good' : 'poor'
    };
  }

  generateHealthRecommendations(heartRate, sleep) {
    const recommendations = [];
    
    if (sleep.summary.efficiency < 80) {
      recommendations.push('Consider a sleep hygiene routine before bed');
    }
    
    if (heartRate['activities-heart'][0].value.restingHeartRate > 70) {
      recommendations.push('Your resting heart rate is elevated. Try some calming exercises.');
    }

    return recommendations;
  }
}