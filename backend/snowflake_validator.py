import re


class SnowflakeValidator:
    def __init__(self, query):
        self.query = query
        self.validation_result = []

    def transform(self):
        self.query = self.query.replace('\n', '"').\
                    strip().replace('"', '').upper()

    def update_validation_result(self, validation_name, sql, msg_type, msg):
        self.validation_result.append({
            'validation_name': validation_name,
            'sql': sql,
            'msg_type': msg_type,
            'msg': msg
        })

    def validate_backup_table_name(self):
        backup_table_patterns = ['BACKUP','BKP','BKUP']
        pattern = re.compile(r'CREATE\s+TABLE\s+[A-Z0-9_]+')
        match = pattern.findall(self.query)
        if match:
            sql = match[0]
            table_name = sql.split()[-1]
            for pattern in backup_table_patterns:
                if pattern in table_name:
                    self.update_validation_result(
                        'Backup Table',
                        sql,
                        'warning',
                        'Backup table should not be created',
                    )

    def custom_retention_period(self):
        pattern = re.compile(r'DATA_RETENTION_TIME_IN_DAYS\s*=\s*\d+')
        match = pattern.findall(self.query)
        max_retention_period = 7
        if match:
            sql = match[0]
            retention_period = int(sql.split('=')[-1].strip())
            if retention_period > max_retention_period:
                self.update_validation_result(
                    'Custom Retention Period',
                    sql,
                    'error',
                    f'Retention period is greater than {max_retention_period} days',
                )

    def validate(self):
        self.transform()
        self.validate_backup_table_name()
        self.custom_retention_period()
        return self.validation_result



if __name__ == '__main__':
    query = '''
    CREATE TABLE TEST_TABLE_1_BKP (
        ID INT,
        NAME VARCHAR(255)
    )
    data_retention_time_in_days = 31
    '''
    validator = SnowflakeValidator(query)
    print(validator.validate())
