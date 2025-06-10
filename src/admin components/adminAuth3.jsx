const authProvider3 = {
    async login({ email, password }) {
        // axios.post(''+import.meta.env.VITE_LOCAL_URL+'/api/login', user, { withCredentials: true })
        const request = new Request(""+import.meta.env.VITE_LOCAL_URL+"/api/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "include",
        });
        let response;
        try {
            response = await fetch(request);
        } catch (_error) {
            throw new Error("Network error");
        }
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText);
        }
        const auth = await response.json();
        localStorage.setItem("auth", JSON.stringify(auth));
    },
    logout: () => {
        localStorage.removeItem('auth');
        return Promise.resolve();
    },
    checkAuth: () =>
        localStorage.getItem('auth') ? Promise.resolve() : Promise.reject(),
    checkError:  (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject();
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    },
};

export default authProvider3;