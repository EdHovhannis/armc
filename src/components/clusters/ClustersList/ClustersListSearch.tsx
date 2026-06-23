import { FormControl, Input, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import * as React from 'react';

export interface IClustersListSearch {
  search: string;
  handleSearch(event: React.ChangeEvent<HTMLInputElement>): void;
}

const ClustersListSearch: React.FC<IClustersListSearch> = ({ search, handleSearch }: IClustersListSearch) => {
  return (
    <FormControl>
      <Input
        value={search}
        placeholder="Поиск"
        endAdornment={
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        }
        onChange={handleSearch}
      />
    </FormControl>
  );
};

export default ClustersListSearch;
