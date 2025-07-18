import React from 'react';
import { connect } from 'react-redux';
import {
  toggleExportModal,
  toggleLayers,
  toggleSidebar,
  toggleTextLabels,
  toggleExpandAllPipelines,
  toggleOrientation,
} from '../../actions';
import { toggleModularPipelinesVisibilityState } from '../../actions/modular-pipelines';
import IconButton from '../ui/icon-button';
import LabelIcon from '../icons/label';
import ExportIcon from '../icons/export';
import LayersIcon from '../icons/layers';
import LeftRightIcon from '../icons/left-right';
import TopBottomIcon from '../icons/top-bottom';
import PrimaryToolbar from '../primary-toolbar';
import { getVisibleLayerIDs } from '../../selectors/disabled';
import ExpandPipelinesIcon from '../icons/expand-pipelines';
import CollapsePipelinesIcon from '../icons/collapse-pipelines';
import { useGeneratePathname } from '../../utils/hooks/use-generate-pathname';
import { VIEW } from '../../config';

/**
 * Main controls for filtering the chart data
 * @param {Function} onToggleTextLabels Handle toggling text labels on/off
 * @param {Boolean} textLabels Whether text labels are displayed
 */
export const FlowchartPrimaryToolbar = ({
  disableLayerBtn,
  onToggleExportModal,
  onToggleLayers,
  onToggleSidebar,
  onToggleTextLabels,
  textLabels,
  visible,
  display,
  visibleLayers,
  expandedPipelines,
  onToggleExpandAllPipelines,
  orientation,
  onToggleOrientation,
  isFlowchartView,
}) => {
  const { toSetQueryParam } = useGeneratePathname();

  const handleToggleExpandAllPipelines = () => {
    const isExpanded = !expandedPipelines;
    onToggleExpandAllPipelines(isExpanded);
    toSetQueryParam('expandAllPipelines', isExpanded.toString());
  };

  return (
    <>
      <PrimaryToolbar
        onToggleSidebar={onToggleSidebar}
        visible={visible}
        display={display}
        dataTest={`sidebar-flowchart-visible-btn-${visible.sidebar}`}
      >
        <IconButton
          active={textLabels}
          ariaLabel={`${textLabels ? 'Hide' : 'Show'} text labels`}
          className={'pipeline-menu-button--labels'}
          dataTest={`sidebar-flowchart-labels-btn-${textLabels}`}
          icon={LabelIcon}
          labelText={`${textLabels ? 'Hide' : 'Show'} text labels`}
          onClick={() => onToggleTextLabels(!textLabels)}
          visible={isFlowchartView && display.labelBtn}
        />
        <IconButton
          active={visibleLayers}
          ariaLabel={`Turn data layers ${visibleLayers ? 'off' : 'on'}`}
          className={'pipeline-menu-button--layers'}
          dataTest={`sidebar-flowchart-layers-btn-${visibleLayers}`}
          disabled={disableLayerBtn}
          icon={LayersIcon}
          labelText={`${visibleLayers ? 'Hide' : 'Show'} layers`}
          onClick={() => onToggleLayers(!visibleLayers)}
          visible={display.layerBtn}
        />
        <IconButton
          ariaLabel="Change flowchart orientation"
          className={'pipeline-menu-button--orientation'}
          dataTest={'sidebar-flowchart-orientation-btn'}
          icon={orientation === 'vertical' ? TopBottomIcon : LeftRightIcon}
          labelText="Change orientation"
          onClick={() =>
            onToggleOrientation(
              orientation === 'vertical' ? 'horizontal' : 'vertical'
            )
          }
          visible={display.orientationBtn}
        />
        <IconButton
          active={expandedPipelines}
          ariaLabel={
            expandedPipelines
              ? 'Collapse all modular pipelines'
              : 'Expand all modular pipelines'
          }
          className={'pipeline-menu-button--pipeline'}
          dataTest={`sidebar-flowchart-expand-pipeline-btn-${expandedPipelines}`}
          icon={expandedPipelines ? CollapsePipelinesIcon : ExpandPipelinesIcon}
          labelText={
            expandedPipelines ? 'Collapse pipelines' : 'Expand pipelines'
          }
          onClick={handleToggleExpandAllPipelines}
          visible={isFlowchartView && display.expandPipelinesBtn}
        />
        <IconButton
          ariaLabel="Export graph as SVG or PNG"
          className={'pipeline-menu-button--export'}
          dataTest={'sidebar-flowchart-export-btn'}
          icon={ExportIcon}
          labelText="Export visualisation"
          onClick={() => onToggleExportModal(true)}
          visible={display.exportBtn}
        />
      </PrimaryToolbar>
    </>
  );
};

export const mapStateToProps = (state) => ({
  disableLayerBtn: !state.layer.ids.length,
  textLabels: state.textLabels,
  visible: state.visible,
  display: state.display,
  visibleLayers: Boolean(getVisibleLayerIDs(state).length),
  orientation: state.orientation,
  expandedPipelines: state.expandAllPipelines,
  isFlowchartView: state.view === VIEW.FLOWCHART,
});

export const mapDispatchToProps = (dispatch) => ({
  onToggleExportModal: (value) => {
    dispatch(toggleExportModal(value));
  },
  onToggleLayers: (value) => {
    dispatch(toggleLayers(Boolean(value)));
  },
  onToggleSidebar: (visible) => {
    dispatch(toggleSidebar(visible));
  },
  onToggleTextLabels: (value) => {
    dispatch(toggleTextLabels(Boolean(value)));
  },
  onToggleExpandAllPipelines: (isExpanded) => {
    dispatch(toggleExpandAllPipelines(isExpanded));
    dispatch(toggleModularPipelinesVisibilityState(isExpanded));
  },
  onToggleOrientation: (value) => {
    dispatch(toggleOrientation(value));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlowchartPrimaryToolbar);
