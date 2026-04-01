const DataService = (() => {
  const STORAGE_KEY = 'medicapp-crm-data';

  const defaultState = {
    appointments: [],
    doctors: [],
    patients: [],
    payments: [],
  };

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn('Invalid saved state, resetting', e);
      }
    }
    return defaultState;
  };

  const save = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const state = load();

  const getEntity = (kind) => state[kind] || [];

  const setEntity = (kind, list) => {
    state[kind] = list;
    save(state);
  };

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  return {
    getAll(kind) { return [...getEntity(kind)]; },
    getById(kind,id){ return getEntity(kind).find((x)=>x.id===id)||null;},
    create(kind,data){ const item={id:generateId(),...data}; const list=getEntity(kind); list.push(item); setEntity(kind,list); return item; },
    update(kind,id,data){ const list=getEntity(kind); const idx=list.findIndex((x)=>x.id===id); if(idx===-1)return null; list[idx]= {...list[idx],...data}; setEntity(kind,list); return list[idx]; },
    remove(kind,id){ const list=getEntity(kind); const next=list.filter((x)=>x.id!==id); setEntity(kind,next); },
    reset(){ setEntity('appointments',[]); setEntity('doctors',[]); setEntity('patients',[]); setEntity('payments',[]); },
  };
})();
