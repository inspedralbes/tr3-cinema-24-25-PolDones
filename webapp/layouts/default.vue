<template>
  <div class="app-layout fade-in">
    <div class="glass-background"></div>
    <div class="noise-overlay"></div>
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
        <p>&copy; 2026 Cinema Ticket System - Creat per Pol Dones</p>
      </div>
    </footer>
  </div>
</template>

<style>
.main-header {
  height: 80px;
  display: flex;
  align-items: center;
  background: rgba(10, 10, 12, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-soft);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
  color: var(--ink-tertiary);
  text-decoration: none;
  margin-left: 2.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--brand);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.nav-links a:hover, .nav-links a.router-link-active {
  color: var(--ink-primary);
}

.nav-links a.router-link-active::after {
  width: 100%;
  box-shadow: 0 0 10px var(--brand-glow);
}

.main-footer {
  margin-top: 6rem;
  padding: 3rem 0;
  border-top: 1px solid var(--border-soft);
  text-align: center;
  color: var(--ink-tertiary);
  font-size: 0.85rem;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
}
</style>
