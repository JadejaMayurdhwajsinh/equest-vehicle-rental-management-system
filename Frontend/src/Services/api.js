// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');

    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Add token to request headers
    this.api.interceptors.request.use((config) => {
      if (this.token) config.headers.Authorization = `Bearer ${this.token}`;
      return config;
    });

    // Handle 401 globally
    this.api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          this.logout();
          window.location.href = '/';
        }
        return Promise.reject(err);
      }
    );
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    try {
      const res = await this.api.request({ url: endpoint, ...options });
      return res.data;
    } catch (err) {
      console.error('API Error:', err);
      if (err.response) throw new Error(err.response.data?.message || 'Server error');
      if (err.request) throw new Error('Network error');
      throw new Error(err.message || 'Unexpected error');
    }
  }

  async requestFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // ================= AUTH =================
  register(userData) {
    const formData = new FormData();
   
    return this.requestFormData('/auth/register', formData);
  }

  login(email, password) {
    return this.request('/auth/login', { method: 'POST', data: { email, password } });
  }

  logoutUser() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  getProfile() {
    return this.request('/auth/profile');
  }

  updateProfile(profileData) {
    return this.request('/auth/profile', { method: 'PUT', data: profileData });
  }

  // ================= VEHICLES =================
  getVehicles(params = {}) {
    return this.request('/vehicles', { method: 'GET', params });
  }

  getVehicleById(id) {
    return this.request(`/vehicles/${id}`);
  }

  addVehicle(vehicleData) {
    return this.request('/vehicles', { method: 'POST', data: vehicleData });
  }

  updateVehicle(id, vehicleData) {
    return this.request(`/vehicles/${id}`, { method: 'PUT', data: vehicleData });
  }

  updateVehicleStatus(id, statusData) {
    return this.request(`/vehicles/${id}/status`, { method: 'PUT', data: statusData });
  }

  // ================= BOOKINGS =================
  createBooking(bookingData) {
    return this.request('/bookings', { method: 'POST', data: bookingData });
  }

  getCustomerBookings(customerId) {
    return this.request(`/bookings/customer/${customerId}`);
  }

  getAgentBookings(agentId) {
    return this.request(`/bookings/agent/${agentId}`);
  }

  pickupBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/pickup`, { method: 'PUT' });
  }

  returnBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/return`, { method: 'PUT' });
  }

  cancelBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/cancel`, { method: 'DELETE' });
  }

  // ================= ANALYTICS =================
  getOverview() {
    return this.request('/analytics/overview');
  }

  getBookingsAnalytics() {
    return this.request('/analytics/bookings');
  }

  getRevenueAnalytics() {
    return this.request('/analytics/revenue');
  }

  getVehicleUtilization() {
    return this.request('/analytics/vehicles/utilization');
  }

  // ================= UTILITIES =================
  isAuthenticated() {
    return !!this.token;
  }

  getUserRole() {
    if (!this.token) return null;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }
}

export default new ApiService();
