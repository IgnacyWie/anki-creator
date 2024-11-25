import Reverso from 'reverso-api'

const reverso = new Reverso()

export const queryContext = async (word: string): Promise<{ source: string, target: string }> => {
  const data = await reverso.getContext(word, 'dutch', 'english')

  // get the first example
  if (!data.examples || !data.examples.length) {
    console.error('No examples found')
    return
  }

  const example = data.examples[0]

  // Now add some HTML
  const regex = new RegExp(`\\b(${word})\\b`, 'gi'); // Match the word case-insensitively
  example.source = example.source.replace(regex, '<strong>$1</strong>');

  console.log(example)
  return example
}
