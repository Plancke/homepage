import useSWR from "swr";
import { useTranslation } from "next-i18next";
import { FiCpu, FiUpload, FiDownload } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";

import { calculateCPUPercent, calculateUsedMemory, calculateThroughput } from "./stats-helpers";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

function SimpleBadge({ icon, label, color }) {
  const Icon = icon;

  return (
    <div className="flex flex-row ml-1 first:ml-0 w-auto text-center overflow-hidden px-1.5 py-0.5 bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] docker-status">
      <Icon className="w-3 h-3" />
      <div className={`pl-1 text-[8px] font-bold ${color} uppercase`}>{label}</div>
    </div>
  )
}

export default function Component({ service, statsToggles }) {
  const { t } = useTranslation();

  const { data: statusData, error: statusError } = useSWR(
    `/api/docker/status/${service.container}/${service.server || ""}`,
  );

  const { data: statsData, error: statsError } = useSWR(`/api/docker/stats/${service.container}/${service.server || ""}`);

  if (statsError || statsData?.error || statusError || statusData?.error) {
    const finalError = statsError ?? statsData?.error ?? statusError ?? statusData?.error;

    if (statsToggles.mode === "slim")
      return undefined;

    return <Container service={service} error={finalError} />;
  }

  if (statusData && !(statusData.status.includes("running") || statusData.status.includes("partial"))) {
    if (statsToggles.mode === "slim")
      return undefined;

    return (
      <Container>
        <Block label={t("widget.status")} value={t("docker.offline")} />
      </Container>
    );
  }

  if (!statsData || !statusData) {
    if (statsToggles.mode === "slim")
      return (
        <>
          {statsToggles.show.cpu && (<SimpleBadge icon={FiCpu} />)}
          {statsToggles.show.memory && (<SimpleBadge icon={FaMemory} />)}
          {statsToggles.show.rx && (<SimpleBadge icon={FiDownload} />)}
          {statsToggles.show.tx && (<SimpleBadge icon={FiUpload} />)}
        </>
      );

    return (
      <Container service={service}>
        <Block label="docker.cpu" />
        <Block label="docker.mem" />
        <Block label="docker.rx" />
        <Block label="docker.tx" />
      </Container>
    );
  }

  const { rxBytes, txBytes } = calculateThroughput(statsData.stats);

  if (statsToggles.mode === "slim") {
    return (
      <>
        {statsToggles.show.cpu && (
          <SimpleBadge icon={FiCpu} label={t("common.percent", { value: calculateCPUPercent(statsData.stats) })} color="text-black/20 dark:text-white/40" />
        )}

        {statsToggles.show.memory && statsData.stats.memory_stats.usage && (
          <SimpleBadge icon={FaMemory} label={t("common.bytes", { value: calculateUsedMemory(statsData.stats) })} color="text-black/20 dark:text-white/40" />
        )}
        {statsData.stats.networks && (
          <>
            {statsToggles.show.rx && (<SimpleBadge icon={FiDownload} label={t("common.bytes", { value: rxBytes })} color="text-black/20 dark:text-white/40" />)}
            {statsToggles.show.tx && (<SimpleBadge icon={FiUpload} label={t("common.bytes", { value: txBytes })} color="text-black/20 dark:text-white/40" />)}
          </>
        )}
      </>
    );
  }

  return (
    <Container service={service}>
      <Block label="docker.cpu" value={t("common.percent", { value: calculateCPUPercent(statsData.stats) })} />
      {statsData.stats.memory_stats.usage && (
        <Block label="docker.mem" value={t("common.bytes", { value: calculateUsedMemory(statsData.stats) })} />
      )}
      {statsData.stats.networks && (
        <>
          {statsData.stats.show.rx && (<Block label="docker.rx" value={t("common.bytes", { value: rxBytes })} />)}
          {statsData.stats.show.tx && (<Block label="docker.tx" value={t("common.bytes", { value: txBytes })} />)}
        </>
      )}
    </Container>
  );
}
