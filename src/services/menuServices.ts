
interface PermissionsResponse {
  status: string;
  message: string;
  data: {
    allowed_menus: string[];
    allowed_submenus: string[];
  };
}

export const fetchUserPermissions = async (roleName: string): Promise<{ allowed_menus: string[], allowed_submenus: string[] }> => {
  try {
    const token = localStorage.getItem('token'); 
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    
    // Bangun URL dengan query parameter
    const url = new URL(`${API_BASE_URL}/access/permissions`);
    url.searchParams.append('role_name', roleName);

    const response = await fetch(url.toString(), {
      method: 'GET', 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}`,
      },
    });

    // Periksa apakah respons HTTP berhasil (status 2xx)
    if (!response.ok) {
      const errorData = await response.json(); // Coba parse error response
      console.error('Failed to fetch user permissions (HTTP error):', response.status, errorData.message);
      return { allowed_menus: [], allowed_submenus: [] };
    }

    const data: PermissionsResponse = await response.json();

    if (data.status === 'success') {
      return data.data;
    } else {
      console.error('Failed to fetch user permissions:', data.message);
      return { allowed_menus: [], allowed_submenus: [] };
    }
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return { allowed_menus: [], allowed_submenus: [] };
  }
};