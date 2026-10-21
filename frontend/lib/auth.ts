export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  try {
    const response = await fetch("http://https://datapilot-api-sgvj.onrender.com/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("access_token");
      return null;
    }

    const data = await response.json();

    return data.user;
  } catch {
    return null;
  }
}