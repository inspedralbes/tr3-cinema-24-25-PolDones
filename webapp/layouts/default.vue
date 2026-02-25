<template>
  <div class="app-layout">
    <header class="main-header">
      <nav class="container nav-bar">
        <NuxtLink to="/" class="logo serif">Cinema<span>Premium</span></NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/">Inici</NuxtLink>
          <NuxtLink to="/entrades">Les meves entrades</NuxtLink>
          <NuxtLink to="/admin">Admin</NuxtLink>
        </div>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>&copy; 2026 Cinema Ticket System - Creat amb ❤️ per Pol Dones</p>
      </div>
    </footer>
  </div>
</template>

<style>
.main-header {
  height: 80px;
  display: flex;
  align-items: center;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  letter-spacing: -1px;
}

.logo span {
  color: var(--primary);
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
  margin-left: 2rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover, .nav-links a.router-link-active {
  color: white;
}

.main-footer {
  margin-top: 4rem;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #666;
}
</style>
