/* tab icons, edition 3: the N64 versions are sampled down to a 16 x 16 grid of chunky pixels, like a low-res texture */
var icSvg0 = icSvg;
icSvg = function (lvl, defs, body) {
  if (lvl !== 1) return icSvg0(lvl, defs, body);
  var id = 'icpx' + (icN++), f = '<filter id="' + id + '" filterUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><feFlood x="1" y="1" width="1" height="1"/><feComposite width="3" height="3"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="1.5"/></filter>';
  return icSvg0(lvl, (defs || '') + f, '<g filter="url(#' + id + ')">' + body + '</g>');
};
