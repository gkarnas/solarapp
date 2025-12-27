export interface ClientField {
  qty: number | null;
  info: string;
}

export interface Client {
  id: string;
  date: string;
  name: string;
  address: string;
  neighborhood: string;
  phone: number;
  email: string;
  system_size: number;

  inverter: ClientField;
  panels: ClientField;
  battery: ClientField;

  tiled_roof: ClientField;
  cb: ClientField;
  rcd: ClientField;
  export_control: ClientField;
  neutral_link: ClientField;
  ac_isolator: ClientField;
  iso_link: ClientField;
  enclosure: ClientField;
  hw_timer: ClientField;
  dc_run: ClientField;
  ac_run: ClientField;
  split_circuit: ClientField;

  extra_services: string;
  visit_notes: string;
  service_notes: string;
}
