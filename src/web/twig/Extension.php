<?php
/**
 * Google Maps plugin for Craft CMS
 *
 * Maps in minutes. Powered by Google Maps.
 *
 * @author    Double Secret Agency
 * @link      https://plugins.doublesecretagency.com/
 * @copyright Copyright (c) 2014 Double Secret Agency
 */

namespace doublesecretagency\googlemaps\web\twig;

use doublesecretagency\googlemaps\GoogleMapsPlugin;
use doublesecretagency\googlemaps\helpers\GoogleMaps;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class Extension extends AbstractExtension implements GlobalsInterface
{

    /**
     * @inheritDoc
     */
    public function getGlobals(): array
    {
        return ['googleMaps' => new GoogleMaps];
    }

}
