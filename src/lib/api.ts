// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/log-in'; // Redirect to login on token expiry
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch (err) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.error || errorData.message || 'Something went wrong');
    }
    
    // Check if the response is empty (e.g. 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
}

export const api = new ApiClient();
