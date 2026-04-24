function generateSessionFeedback(messages, corrections, level) {
  const totalMessages = messages.filter(m => m.role === 'user').length;
  const totalErrors = corrections.length;
  
  // Categorize errors
  const errorCategories = {
    grammar: corrections.filter(c => c.type === 'grammar').length,
    vocabulary: corrections.filter(c => c.type === 'vocabulary').length,
    punctuation: corrections.filter(c => c.type === 'punctuation').length
  };

  // Calculate accuracy
  const accuracy = totalMessages > 0 
    ? Math.max(0, Math.round(((totalMessages - totalErrors) / totalMessages) * 100))
    : 100;

  // Identify main difficulties
  const difficulties = [];
  if (errorCategories.grammar > 0) difficulties.push('Gramática');
  if (errorCategories.vocabulary > 0) difficulties.push('Vocabulário');
  if (errorCategories.punctuation > 0) difficulties.push('Pontuação');

  // Positive points
  const positives = [];
  if (totalMessages >= 10) positives.push('Ótimo volume de prática!');
  if (accuracy >= 80) positives.push('Excelente precisão gramatical!');
  if (accuracy >= 60 && accuracy < 80) positives.push('Boa tentativa, continue praticando!');
  if (totalMessages >= 5) positives.push('Manteve uma conversa consistente');

  // Exercise suggestions based on errors
  const suggestedExercises = [];
  if (errorCategories.grammar > 0) {
    suggestedExercises.push({
      type: 'fill_blank',
      focus: 'grammar',
      description: 'Exercícios de preenchimento para praticar estruturas gramaticais'
    });
  }
  if (errorCategories.vocabulary > 0) {
    suggestedExercises.push({
      type: 'translation',
      focus: 'vocabulary',
      description: 'Exercícios de tradução para expandir vocabulário'
    });
  }
  if (errorCategories.punctuation > 0) {
    suggestedExercises.push({
      type: 'multiple_choice',
      focus: 'punctuation',
      description: 'Exercícios de múltipla escolha sobre pontuação'
    });
  }

  // Overall rating
  let rating;
  if (accuracy >= 90) rating = 'Excelente';
  else if (accuracy >= 75) rating = 'Muito Bom';
  else if (accuracy >= 60) rating = 'Bom';
  else if (accuracy >= 40) rating = 'Regular';
  else rating = 'Precisa Melhorar';

  return {
    totalMessages,
    totalErrors,
    accuracy,
    rating,
    errorCategories,
    difficulties: difficulties.length > 0 ? difficulties : ['Nenhuma dificuldade significativa'],
    positives: positives.length > 0 ? positives : ['Continue praticando para melhorar!'],
    suggestedExercises,
    message: `Você enviou ${totalMessages} mensagens com ${accuracy}% de precisão. ${
      totalErrors > 0 
        ? `Foram encontrados ${totalErrors} erro(s). Continue praticando!` 
        : 'Parabéns, nenhum erro encontrado!'
    }`
  };
}

module.exports = { generateSessionFeedback };
