const AdminAuth = {
    TOKEN_KEY: 'palmasAdminToken',
    USER_KEY: 'palmasAdminUser',

    getToken() {
        return sessionStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const raw = sessionStorage.getItem(this.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    setSession(token, user) {
        sessionStorage.setItem(this.TOKEN_KEY, token);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    clearSession() {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
    },

    isLoggedIn() {
        return Boolean(this.getToken());
    },

    authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getToken()}`
        };
    },

    async apiFetch(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.authHeaders(),
                ...(options.headers || {})
            }
        });

        if (response.status === 401 || response.status === 403) {
            this.clearSession();
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/web/admin/login.html';
            }
            throw new Error('Sesión expirada');
        }

        return response;
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/web/admin/login.html';
            return false;
        }
        return true;
    },

    logout() {
        this.clearSession();
        window.location.href = '/web/admin/login.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        if (AdminAuth.isLoggedIn()) {
            window.location.href = '/web/admin/dashboard.html';
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('btnLogin');
            const alert = document.getElementById('loginAlert');
            const btnText = btn.querySelector('.btn-text');
            const spinner = btn.querySelector('.spinner-border');

            btn.disabled = true;
            btnText.textContent = 'Ingresando...';
            spinner.classList.remove('d-none');
            alert.classList.add('d-none');

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value.trim(),
                        password: document.getElementById('password').value
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al iniciar sesión');
                }

                if (data.usuario.rol !== 'admin') {
                    throw new Error('Esta cuenta no tiene permisos de administrador.');
                }

                AdminAuth.setSession(data.token, data.usuario);
                window.location.href = '/web/admin/dashboard.html';
            } catch (err) {
                alert.textContent = err.message;
                alert.classList.remove('d-none');
            } finally {
                btn.disabled = false;
                btnText.textContent = 'Iniciar sesión';
                spinner.classList.add('d-none');
            }
        });
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => AdminAuth.logout());
    }
});

window.AdminAuth = AdminAuth;
