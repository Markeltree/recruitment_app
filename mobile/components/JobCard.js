import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CompanyLogo from './CompanyLogo';
import PressableScale from './PressableScale';
import { Tag } from './Chip';
import { formatSalary, shadow } from '../constants/theme';

export default function JobCard({ job, onPress, compact }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.975} className="mb-3 rounded-[22px] border border-line bg-white p-4" style={shadow.sm}>
      <View className="flex-row items-center">
        <CompanyLogo name={job.company} uri={job.companyLogo} size={48} />
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-ink-900" numberOfLines={1}>
            {job.title}
          </Text>
          <Text className="mt-0.5 text-sm text-ink-500" numberOfLines={1}>
            {job.company}
          </Text>
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-50">
          <Ionicons name="bookmark" size={14} color="#2F6BFF" />
        </View>
      </View>

      {!compact ? (
        <>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {job.location ? <Tag icon="location-outline" label={job.location} /> : null}
            {job.type ? <Tag icon="briefcase-outline" label={job.type} /> : null}
            {job.workMode ? <Tag icon="globe-outline" label={job.workMode} /> : null}
          </View>
          <View className="mt-3 flex-row items-center justify-between border-t border-line pt-3">
            <Text className="text-[15px] font-bold text-ink-900">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</Text>
            <View className="flex-row items-center">
              <Text className="text-xs font-bold text-brand-600">View role</Text>
              <Ionicons name="arrow-forward" size={13} color="#1F55E0" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </>
      ) : null}
    </PressableScale>
  );
}
