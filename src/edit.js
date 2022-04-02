/**
 * Internal dependencies
 */
import './editor.scss';

/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import {
	ComboboxControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import countries from '../assets/countries.json';
import { getEmojiFlag } from './utils';
import Preview from './preview';

function Edit( props ) {
	const { attributes, setAttributes, newRelatedPosts } = props;
	const { countryCode, relatedPosts } = attributes;
	const options = Object.keys( countries ).map( ( code ) => ( {
		value: code,
		label: getEmojiFlag( code ) + '  ' + countries[ code ] + ' — ' + code,
	} ) );

	const [ isPreview, setPreview ] = useState();

	useEffect( () => setPreview( countryCode ), [ countryCode ] );

	const handleChangeCountry = () => {
		if ( isPreview ) setPreview( false );
		else if ( countryCode ) setPreview( true );
	};

	useEffect( () => {
		if ( props.hasResolved ) {
			if (
				JSON.stringify( relatedPosts ) !==
				JSON.stringify( newRelatedPosts )
			) {
				setAttributes( {
					relatedPosts: newRelatedPosts,
				} );
			}
		}
	} );

	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( countryCode !== newCountryCode ) {
			setAttributes( {
				countryCode: newCountryCode,
			} );
		}
	};

	return (
		<div { ...useBlockProps() }>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Country', 'xwp-country-card' ) }
						icon={ edit }
						onClick={ handleChangeCountry }
						disabled={ ! Boolean( countryCode ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div>
				{ isPreview && (
					<Preview
						countryCode={ countryCode }
						relatedPosts={ relatedPosts }
					/>
				) }

				<Placeholder
					icon={ globe }
					label={ __( 'XWP Country Card', 'xwp-country-card' ) }
					isColumnLayout={ true }
					instructions={ __(
						'Type in a name of a contry you want to display on you site.',
						'xwp-country-card'
					) }
				>
					<ComboboxControl
						label={ __( 'Country', 'xwp-country-card' ) }
						hideLabelFromVision
						options={ options }
						value={ countryCode }
						onChange={ handleChangeCountryCode }
						allowReset={ true }
					/>
				</Placeholder>
			</div>
		</div>
	);
}

export default withSelect( ( select, ownProps ) => {
	const currentPostId = select( 'core/editor' ).getCurrentPostId();

	const query = {};

	if ( ownProps.attributes.countryCode ) {
		query.per_page = 5;
		query.search = ownProps.attributes.countryCode;
		query.exclude = currentPostId;
	}

	const selectorArgs = [ 'postType', 'post', query ];

	const posts = select( 'core' ).getEntityRecords( ...selectorArgs );
	const hasResolved = select( 'core' ).hasFinishedResolution(
		'getEntityRecords',
		selectorArgs
	);

	const relatedPosts = posts?.map( ( relatedPost ) => ( {
		id: relatedPost.id,
		title: relatedPost.title?.rendered || relatedPost.link,
		link: relatedPost.link,
		excerpt: relatedPost.excerpt?.rendered || '',
	} ) );

	return {
		...ownProps,
		hasResolved,
		newRelatedPosts: relatedPosts || [],
	};
} )( Edit );
