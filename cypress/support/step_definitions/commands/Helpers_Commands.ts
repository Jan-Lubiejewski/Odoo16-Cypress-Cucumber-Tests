const clearText = (text: string) => {
    return text.trim().replace(/\n/g, '').replace(/\s+/g, ' ');
  };
  
  const clickOutside = () => cy.get('body').dblclick('bottomRight');
  
  export const helpersCommnds = {
    clearText,
    clickOutside,
  };
  