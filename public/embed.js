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
  const primaryColor = currentScript.getAttribute('data-primary-color') || '#18181b';
  const position = currentScript.getAttribute('data-position') || 'bottom-right';
  const presetSize = currentScript.getAttribute('data-size') || 'standard'; // slim | standard | wide

  const LS_SIZE_KEY = 'oracle_widget_custom_size';
  let isOpen = false;

  // Outer Wrapper
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.zIndex = '2147483647';
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
  iframeContainer.style.bottom = '84px';
  iframeContainer.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  
  if (position === 'bottom-left') {
    iframeContainer.style.left = '0';
    iframeContainer.style.transformOrigin = 'bottom left';
  } else {
    iframeContainer.style.right = '0';
    iframeContainer.style.transformOrigin = 'bottom right';
  }

  // Dimension Calculation Logic
  const getPresetDimensions = () => {
    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
      return { width: window.innerWidth - 48, height: window.innerHeight - 140 };
    }
    
    // Check for user-persisted manual size first
    const saved = localStorage.getItem(LS_SIZE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    // Fallback to presets
    switch(presetSize) {
      case 'slim': return { width: 340, height: 500 };
      case 'wide': return { width: 600, height: 750 };
      default: return { width: 420, height: 650 }; // standard
    }
  };

  const updateDimensions = (w, h) => {
    iframeContainer.style.width = w + 'px';
    iframeContainer.style.height = h + 'px';
  };

  const dims = getPresetDimensions();
  updateDimensions(dims.width, dims.height);

  // Resize Handle (Top-Left corner of container)
  const resizer = document.createElement('div');
  resizer.style.position = 'absolute';
  resizer.style.top = '0';
  resizer.style.left = '0';
  resizer.style.width = '32px';
  resizer.style.height = '32px';
  resizer.style.cursor = 'nwse-resize';
  resizer.style.zIndex = '1000';
  resizer.style.display = 'flex';
  resizer.style.alignItems = 'center';
  resizer.style.justifyContent = 'center';
  resizer.style.color = 'rgba(0,0,0,0.1)';
  resizer.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>`;
  
  // Dragging logic
  let isResizing = false;
  resizer.onmousedown = (e) => {
    e.preventDefault();
    isResizing = true;
    iframeContainer.style.transition = 'none'; // Disable animations during active drag
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = parseInt(getComputedStyle(iframeContainer).width, 10);
    const startH = parseInt(getComputedStyle(iframeContainer).height, 10);

    const onMouseMove = (moveE) => {
      if (!isResizing) return;
      // Because it's anchored at the bottom-right, moving mouse left/up increases size
      const deltaX = startX - moveE.clientX;
      const deltaY = startY - moveE.clientY;
      
      const newW = Math.max(300, startW + deltaX);
      const newH = Math.max(400, startH + deltaY);
      
      updateDimensions(newW, newH);
    };

    const onMouseUp = () => {
      isResizing = false;
      iframeContainer.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      localStorage.setItem(LS_SIZE_KEY, JSON.stringify({
        width: parseInt(iframeContainer.style.width, 10),
        height: parseInt(iframeContainer.style.height, 10)
      }));
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  iframeContainer.appendChild(resizer);


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
  iframe.setAttribute('allow', 'clipboard-write');
  iframeContainer.appendChild(iframe);

  // Floating Action Button (FAB)
  const button = document.createElement('button');
  button.style.position = 'absolute';
  button.style.bottom = '0';
  button.style.right = (position === 'bottom-right') ? '0' : 'auto';
  button.style.left = (position === 'bottom-left') ? '0' : 'auto';
  
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
  
  const chatIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M12 11h.01"/><path d="M8 11h.01"/><path d="M16 11h.01"/></svg>`;
  const closeIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  button.innerHTML = chatIcon;
  button.onmouseover = () => { button.style.transform = 'scale(1.05)'; button.style.boxShadow = '0 12px 30px -5px rgba(0,0,0,0.4)'; };
  button.onmouseout = () => { button.style.transform = 'scale(1)'; button.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)'; };

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

  container.appendChild(iframeContainer);
  container.appendChild(button);
  
  if (document.body) {
    document.body.appendChild(container);
  } else {
    document.addEventListener('DOMContentLoaded', () => { document.body.appendChild(container); });
  }
})();
