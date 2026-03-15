import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';

const DEBOUNCE_DELAY = 300;

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const lastQuery = useRef('');
  const timer = useRef<number>();

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      if (lastQuery.current === normalizedQuery) {
        return;
      }

      lastQuery.current = normalizedQuery;

      if (!normalizedQuery) {
        setSuggestions(peopleFromServer);

        return;
      }

      const filtered = peopleFromServer.filter(person =>
        person.name.toLowerCase().includes(normalizedQuery),
      );

      setSuggestions(filtered);
    }, DEBOUNCE_DELAY);
  }, [normalizedQuery]);

  const handleFocus = () => {
    setIsOpen(true);

    if (!query.trim()) {
      setSuggestions(peopleFromServer);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setQuery(value);
    setSelectedPerson(null);
    setIsOpen(true);

    if (!value.trim()) {
      setSuggestions(peopleFromServer);
    }
  };

  const handleSelect = (person: Person) => {
    setQuery(person.name);
    setSelectedPerson(person);
    setIsOpen(false);
  };

  const showNoSuggestions =
    isOpen && normalizedQuery && suggestions.length === 0;

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div className={classNames('dropdown', { 'is-active': isOpen })}>
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={query}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={() =>
                setTimeout(() => {
                  setIsOpen(false);
                }, 150)
              }
            />
          </div>

          {isOpen && suggestions.length > 0 && (
            <div
              className="dropdown-menu"
              role="menu"
              data-cy="suggestions-list"
            >
              <div className="dropdown-content">
                {suggestions.map(person => (
                  <div
                    key={person.slug}
                    className="dropdown-item"
                    data-cy="suggestion-item"
                    onMouseDown={() => handleSelect(person)}
                  >
                    <p
                      className={
                        person.sex === 'm' ? 'has-text-link' : 'has-text-danger'
                      }
                    >
                      {person.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showNoSuggestions && (
          <div
            className="
              notification
              is-danger
              is-light
              mt-3
              is-align-self-flex-start
            "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
