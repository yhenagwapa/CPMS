import { faker } from "@faker-js/faker";

export function fakeSignatory() {
  // Generate names
  const firstName = faker.person.firstName();
  const middleName = faker.person.middleName();
  const lastName = faker.person.lastName();

  // Middle initial
  const middleInitial = middleName.charAt(0).toUpperCase();

  // Initials (F + M + L)
  const initials =
    firstName.charAt(0).toUpperCase() +
    middleInitial +
    lastName.charAt(0).toUpperCase();

  const noMIinitials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();

  // Title options
  const title = faker.helpers.arrayElement([
    "Mr.",
    "Ms.",
    "Mrs.",
    "Dr.",
    "Engr.",
    "Atty.",
  ]);

  // Position options
  const position = faker.helpers.arrayElement([
    "Administrative Assistant",
    "Social Worker",
    "Encoder",
    "Supervisor",
    "Program Coordinator",
    "Manager",
  ]);

  return {
    title,
    firstName,
    middleInitial,
    noMIinitials,
    lastName,
    initials,
    position,
  };
}

export function fakeInvalidSignatory() {
    // Generate invalid values
    const specialChars = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const allowedChars = '-.,';

    const firstName = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const middleName = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const lastName = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,;'

    // Middle initial
    const middleInitial = middleName.charAt(0).toUpperCase();

    // Initials (F + M + L)
    const initials = "ZZZ";

    const title = faker.string.fromCharacters(specialChars, { min: 3, max: 10 })
    const position = faker.string.fromCharacters(specialChars, { min: 3, max: 10 });

    return {
      title,
      firstName,
      middleInitial,
      lastName,
      initials,
      position,
    };
  }
