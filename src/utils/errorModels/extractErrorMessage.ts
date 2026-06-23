// для кейсов когда
// error.errorCode === "ABYSS_UNKNOWN_ERROR"
// && error.message === 'Internal Kafka execution error'
// && error.status === 500
// сделано для кейса detail = "Cannot call endpoint [https://st2-abyss-tengri-02.opsmon.sbt:29094/coordinator/api/kafka/topics/7708]. Cause [[ru.sbt.integration.coordinator.kafka.exception.KafkaInternalException]: [Error occurred while updating partitions count]. Cause [org.apache.kafka.common.errors.InvalidPartitionsException: Topic currently has 3 partitions, which is higher than the requested 2.]]"

export default function extractErrorMessage(errorDetail: string, errorMessage: string): string {
  const causeIndex = errorDetail.indexOf('Cause [');
  if (causeIndex === -1) {
    return errorMessage;
  }

  let translatedError = '';
  if (errorDetail.includes('Kafka cluster has constraint violations')) {
    translatedError = 'Kafka кластер имеет нарушения ограничений: ';
    if (errorDetail.includes('TLS type must be [MUTUAL] instead of [DISABLED]; Internal bootstrap server is not defined for bootstrap servers')) {
      translatedError += 'тип TLS должен быть [MUTUAL] вместо [DISABLED], внутренний bootstrap сервер не определен для bootstrap серверов ';
    } else {
      translatedError += errorDetail
        .split('Cause [')
        .filter((el, i) => i !== 0)[0]
        .split(': ')[1];
    }
    return translatedError;
  }

  const detailMessages = errorDetail
    .split('Cause [')
    .filter((el, i) => i !== 0)
    .map((el) => {
      const colonIndex = el.indexOf(':');
      const errorPart = el.slice(colonIndex + 1);
      const errorMes = errorPart.replace(/[;\[\]:,]/g, '').trim();
      if (errorMes === 'Error occurred while updating partitions count.') {
        return 'Произошла ошибка при обновлении количества партиций.';
      }
      if (errorMes.split(' ').slice(0, 3).join(' ') === 'Topic currently has') {
        return errorMes
          .replace('Topic currently has', 'Количество партиций в топике ')
          .replace(' partitions', ', ')
          .replace('which is higher than', 'что больше, чем')
          .replace('the requested', 'запрашиваемые');
      }
      if (errorMes.split(' ').slice(0, 3).join(' ') === 'Topic already has') {
        return errorMes.replace('Topic already has', 'Количество партиций в топике уже ').replace(' partitions', '.');
      }
      if (errorMes.split(' ').slice(0, 2).join(' ') === 'The topic' && errorMes.split(' ').slice(-3).join(' ') === 'does not exist.') {
        return errorMes.replace('The topic', 'Топик').replace('does not exist.', 'не существует.');
      }
      return errorMes;
    })
    .join(' ');
  return detailMessages;
}
