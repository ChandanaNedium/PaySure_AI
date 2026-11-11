import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const DemoContext = createContext(null);

export const DemoProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/demo/scenarios');
      setScenarios(res.data);
      if (res.data.length > 0 && !activeScenario) {
        // default to scenario 4 (Network Timeout / State Drift) or 2 (Card Declined)
        setActiveScenario(res.data[3]);
      }
    } catch (err) {
      console.error('Error fetching demo scenarios', err);
    } finally {
      setLoadingScenarios(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const selectScenario = (scenario) => {
    setActiveScenario(scenario);
    showToast(`Loaded Scenario: ${scenario.title}`, 'info');
  };

  const resetDemo = async () => {
    try {
      await api.post('/demo/reset');
      showToast('Demo data reset to pristine state.', 'success');
      await fetchScenarios();
      window.location.reload();
    } catch (err) {
      showToast('Error resetting demo', 'error');
    }
  };

  return (
    <DemoContext.Provider
      value={{
        scenarios,
        activeScenario,
        selectScenario,
        resetDemo,
        toast,
        showToast,
        loadingScenarios
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
