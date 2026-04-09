export interface ChartRecord {
  title: string;
  place: string;
  gender: string;
  age: string;
}

export interface ChartGenderGroup {
  male: ChartRecord[];
  female: ChartRecord[];
}

export interface ChartData {
  location: string;
  data: ChartGenderGroup;
}
