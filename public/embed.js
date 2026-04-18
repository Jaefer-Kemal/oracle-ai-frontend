(function() {
  // Gracefully find the script instance that initiated this embed
  const scripts = document.getElementsByTagName('script');
  let currentScript = scripts[scripts.length - 1]; // Fallback
  for(let i = 0; i < scripts.length; i++) {
    if(scripts[i].src && scripts[i].src.includes('embed.js')) {
      currentScript = scripts[i];
    }
  }

  // Configured Parameters (or defaults)
  let origin = 'http://localhost:3000';
  if (currentScript && currentScript.src) {
    try {
      const scriptUrl = new URL(currentScript.src);
      origin = scriptUrl.origin;
    } catch (e) {
      // Fallback if URL parsing fails
    }
  }

  const chatUrl = currentScript.getAttribute('data-chat-url') || `${origin}/iframe/chat`;
  const primaryColor = currentScript.getAttribute('data-primary-color') || '#18181b'; // Default to a primary dark
  const position = currentScript.getAttribute('data-position') || 'bottom-right';

  let isOpen = false;

  // Outer Wrapper (Isolated context)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.zIndex = '2147483647'; // Maximum possible z-index
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  if (position === 'bottom-left') {
    container.style.bottom = '24px';
    container.style.left = '24px';
  } else {
    container.style.bottom = '24px';
    container.style.right = '24px';
  }

  // Iframe Container Element
  const iframeContainer = document.createElement('div');
  iframeContainer.style.position = 'absolute';
  iframeContainer.style.bottom = '84px'; // Offset above the button
  iframeContainer.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  
  if (position === 'bottom-left') {
    iframeContainer.style.left = '0';
    iframeContainer.style.transformOrigin = 'bottom left';
  } else {
    iframeContainer.style.right = '0';
    iframeContainer.style.transformOrigin = 'bottom right';
  }

  // Dynamic Responsive Dimensions
  const setDimensions = () => {
    const isMobile = window.innerWidth <= 640;
    iframeContainer.style.width = isMobile ? 'calc(100vw - 48px)' : '420px';
    iframeContainer.style.height = isMobile ? 'calc(100vh - 140px)' : '650px';
    iframeContainer.style.maxHeight = isMobile ? 'none' : '80vh';
  };
  setDimensions();

  // Premium Aesthetics for Container
  iframeContainer.style.backgroundColor = '#ffffff';
  iframeContainer.style.borderRadius = '24px';
  iframeContainer.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 20px rgba(0,0,0,0.05)';
  iframeContainer.style.overflow = 'hidden';
  iframeContainer.style.opacity = '0';
  iframeContainer.style.transform = 'scale(0.95) translateY(20px)';
  iframeContainer.style.pointerEvents = 'none';

  // The actual Next.js Iframe
  const iframe = document.createElement('iframe');
  iframe.src = chatUrl;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '24px';
  iframe.style.backgroundColor = 'transparent';
  iframe.setAttribute('title', 'Oracle AI Assistant');
  iframe.setAttribute('allow', 'clipboard-write'); // Enable the AI's copy-code buttons
  iframeContainer.appendChild(iframe);

  // Floating Action Button (FAB)
  const button = document.createElement('button');
  button.style.position = 'absolute';
  button.style.bottom = '0';
  
  if (position === 'bottom-left') {
    button.style.left = '0';
  } else {
    button.style.right = '0';
  }
  
  button.style.width = '64px';
  button.style.height = '64px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = primaryColor;
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
  button.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s';
  button.style.outline = 'none';
  
  // Scalable Vector Graphic Icons
  const chatIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M12 11h.01"/><path d="M8 11h.01"/><path d="M16 11h.01"/></svg>`;
  const closeIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  button.innerHTML = chatIcon;

  // Hover Interactivity
  button.onmouseover = () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 12px 30px -5px rgba(0,0,0,0.4)';
  };
  button.onmouseout = () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
  };

  // Toggle Functionality
  button.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.opacity = '1';
      iframeContainer.style.transform = 'scale(1) translateY(0)';
      iframeContainer.style.pointerEvents = 'all';
      button.innerHTML = closeIcon;
    } else {
      iframeContainer.style.opacity = '0';
      iframeContainer.style.transform = 'scale(0.95) translateY(20px)';
      iframeContainer.style.pointerEvents = 'none';
      button.innerHTML = chatIcon;
    }
  };

  // Handle Resize Events
  window.addEventListener('resize', setDimensions);

  // Mount to DOM
  container.appendChild(iframeContainer);
  container.appendChild(button);
  
  // Wait for body to be available if script is in <head>
  if (document.body) {
    document.body.appendChild(container);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(container);
    });
  }
})();
