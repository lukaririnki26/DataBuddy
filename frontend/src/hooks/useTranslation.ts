import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { translations, Language } from '../i18n/translations';

export const useTranslation = () => {
    const language = useSelector((state: RootState) => state.ui.language) as Language;

    const t = translations[language];

    return { t, language };
};
