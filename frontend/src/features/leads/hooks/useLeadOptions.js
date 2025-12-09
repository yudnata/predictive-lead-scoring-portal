import { useState, useEffect } from 'react';
import MetaService from '../../../api/meta-service';

export const useLeadOptions = () => {
  const [jobOptions, setJobOptions] = useState([]);
  const [maritalOptions, setMaritalOptions] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [poutcomeOptions, setPoutcomeOptions] = useState([]);
  const [contactMethodOptions, setContactMethodOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [jobs, marital, education, poutcomes, contactMethods] = await Promise.all([
          MetaService.getJobs(),
          MetaService.getMaritalStatus(),
          MetaService.getEducationLevels(),
          MetaService.getPoutcomes(),
          MetaService.getContactMethods(),
        ]);
        setJobOptions(jobs);
        setMaritalOptions(marital);
        setEducationOptions(education);
        setPoutcomeOptions(poutcomes);
        setContactMethodOptions(contactMethods);
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    };

    fetchOptions();
  }, []);

  return {
    jobOptions,
    maritalOptions,
    educationOptions,
    poutcomeOptions,
    contactMethodOptions,
  };
};
