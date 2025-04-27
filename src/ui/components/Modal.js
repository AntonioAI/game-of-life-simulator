/**
 * Game of Life Simulator - Modal Dialog Component
 * Handles information modals for UI panels
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Modal manager class
 */
class Modal {
  /**
   * Initialize modal functionality
   */
  static initialize() {
    // Set up modal for Configuration panel
    Modal.setupConfigPanelModal();
    
    // Set up modal for Controls panel
    Modal.setupControlsPanelModal();
    
    // Setup global modal close handlers
    Modal.setupCloseHandlers();
  }
  
  /**
   * Set up Configuration panel modal
   */
  static setupConfigPanelModal() {
    const infoButton = document.getElementById('config-panel-info');
    const modal = document.getElementById('config-panel-modal');
    
    if (infoButton && modal) {
      infoButton.setAttribute('aria-expanded', 'false');
      infoButton.setAttribute('aria-controls', 'config-panel-modal');
      
      infoButton.addEventListener('click', () => {
        Modal.openModal(modal, infoButton);
      });
    }
  }
  
  /**
   * Set up Controls panel modal
   */
  static setupControlsPanelModal() {
    const infoButton = document.getElementById('controls-panel-info');
    const modal = document.getElementById('controls-panel-modal');
    
    if (infoButton && modal) {
      infoButton.setAttribute('aria-expanded', 'false');
      infoButton.setAttribute('aria-controls', 'controls-panel-modal');
      
      infoButton.addEventListener('click', () => {
        Modal.openModal(modal, infoButton);
      });
    }
  }
  
  /**
   * Set up global close handlers for all modals
   */
  static setupCloseHandlers() {
    // Close when clicking the X
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (event) => {
        const modal = event.target.closest('.modal');
        if (modal) {
          const id = modal.id;
          const infoButton = document.querySelector(`[aria-controls="${id}"]`);
          Modal.closeModal(modal, infoButton);
        }
      });
    });
    
    // Close when clicking the Close button
    document.querySelectorAll('.modal-close-btn').forEach(closeBtn => {
      closeBtn.addEventListener('click', (event) => {
        const modal = event.target.closest('.modal');
        if (modal) {
          const id = modal.id;
          const infoButton = document.querySelector(`[aria-controls="${id}"]`);
          Modal.closeModal(modal, infoButton);
        }
      });
    });
    
    // Close when clicking outside the modal content
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          const id = modal.id;
          const infoButton = document.querySelector(`[aria-controls="${id}"]`);
          Modal.closeModal(modal, infoButton);
        }
      });
    });
    
    // Close when pressing Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
          const id = modal.id;
          const infoButton = document.querySelector(`[aria-controls="${id}"]`);
          Modal.closeModal(modal, infoButton);
        });
      }
    });
  }
  
  /**
   * Open a modal
   * @param {HTMLElement} modal - The modal element to open
   * @param {HTMLElement} triggerButton - The button that triggered the modal
   */
  static openModal(modal, triggerButton) {
    if (!modal) return;
    
    // Display the modal
    modal.style.display = 'flex';
    
    // Force reflow to make sure transition can happen
    modal.offsetHeight;
    
    // Add show class to trigger animation
    modal.classList.add('show');
    
    // Update ARIA attributes
    modal.setAttribute('aria-hidden', 'false');
    if (triggerButton) {
      triggerButton.setAttribute('aria-expanded', 'true');
    }
    
    // Add no-scroll to body
    document.body.style.overflow = 'hidden';
    
    // Focus the first focusable element
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  
  /**
   * Close a modal
   * @param {HTMLElement} modal - The modal element to close
   * @param {HTMLElement} triggerButton - The button that triggered the modal
   */
  static closeModal(modal, triggerButton) {
    if (!modal) return;
    
    // Remove show class
    modal.classList.remove('show');
    
    // Update ARIA attributes
    modal.setAttribute('aria-hidden', 'true');
    if (triggerButton) {
      triggerButton.setAttribute('aria-expanded', 'false');
    }
    
    // Wait for animation to finish
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300); // Match the CSS transition time
    
    // Return focus to trigger button
    if (triggerButton) {
      triggerButton.focus();
    }
  }
}

export default Modal; 