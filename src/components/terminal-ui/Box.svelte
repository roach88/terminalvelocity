<script lang="ts">
  import { theme } from '../../stores/theme'

  // Layout props
  export let flexDirection: 'row' | 'column' = 'row';
  export let justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' = 'flex-start';
  export let alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 'stretch';
  export let flexWrap: 'nowrap' | 'wrap' = 'nowrap';
  export let gap: number = 0;

  // Spacing props
  export let padding: number | { top?: number; right?: number; bottom?: number; left?: number } = 0;
  export let margin: number | { top?: number; right?: number; bottom?: number; left?: number } = 0;

  // Border props
  export let borderWidth: string = '1px';
  export let borderStyle: string = 'solid';
  export let borderColor: string = '';
  export let borderRadius: string = '4px';

  // Size props
  export let width: number | string = 'auto';
  export let height: number | string = 'auto';
  export let minWidth: number | string = 'auto';
  export let minHeight: number | string = 'auto';

  // Get padding values
  $: paddingTop = typeof padding === 'number' ? padding : padding.top || 0;
  $: paddingRight = typeof padding === 'number' ? padding : padding.right || 0;
  $: paddingBottom = typeof padding === 'number' ? padding : padding.bottom || 0;
  $: paddingLeft = typeof padding === 'number' ? padding : padding.left || 0;

  // Get margin values
  $: marginTop = typeof margin === 'number' ? margin : margin.top || 0;
  $: marginRight = typeof margin === 'number' ? margin : margin.right || 0;
  $: marginBottom = typeof margin === 'number' ? margin : margin.bottom || 0;
  $: marginLeft = typeof margin === 'number' ? margin : margin.left || 0;
</script>

<div
  class="box"
  style:width={typeof width === 'number' ? `${width}ch` : width}
  style:height={typeof height === 'number' ? `${height}ch` : height}
  style:min-width={typeof minWidth === 'number' ? `${minWidth}ch` : minWidth}
  style:min-height={typeof minHeight === 'number' ? `${minHeight}ch` : minHeight}
  style:margin-top={marginTop ? `${marginTop}em` : undefined}
  style:margin-right={marginRight ? `${marginRight}ch` : undefined}
  style:margin-bottom={marginBottom ? `${marginBottom}em` : undefined}
  style:margin-left={marginLeft ? `${marginLeft}ch` : undefined}
  style:border={`${borderWidth} ${borderStyle} ${borderColor || $theme.foreground}`}
  style:border-radius={borderRadius}
>
  <div class="content" style:padding-top={paddingTop ? `${paddingTop}em` : undefined} style:padding-right={paddingRight ? `${paddingRight}ch` : undefined} style:padding-bottom={paddingBottom ? `${paddingBottom}em` : undefined} style:padding-left={paddingLeft ? `${paddingLeft}ch` : undefined} style:flex-direction={flexDirection} style:justify-content={justifyContent} style:align-items={alignItems} style:flex-wrap={flexWrap} style:gap={gap ? `${gap}ch` : undefined}>
    <slot />
  </div>
</div>

<style>
  .box {
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    display: inline-block;
    position: relative;
  }

  .content {
    display: flex;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
</style>