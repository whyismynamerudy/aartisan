import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import json
import os
import glob

# Data from the JSON comparison results
data = {
    'optimized': {
        'total_duration': 82.88,
        'steps_taken': 3,
        'api_calls': 4,
        'total_tokens': 24264,
        'errors': 3
    },
    'regular': {
        'total_duration': 117.35,
        'steps_taken': 8,
        'api_calls': 9,
        'total_tokens': 415125,
        'errors': 7
    }
}

# Set global style parameters
sns.set_style("whitegrid")
plt.rcParams.update({
    'font.family': 'Arial',  # Similar to TT Commons
    'font.weight': 'medium',
    'axes.labelweight': 'medium',
    'axes.titleweight': 'bold',
    'axes.titlesize': 18,  # Increased from 14
    'axes.labelsize': 16,  # Increased from 12
    'xtick.labelsize': 14,  # Increased from 10
    'ytick.labelsize': 14,  # Increased from 10
    'legend.fontsize': 14,  # Added legend font size
    'legend.title_fontsize': 16  # Added legend title font size
})

# Define consistent colors
OPTIMIZED_COLOR = '#04fcb4'  # Mint green for optimized version
REGULAR_COLOR = '#ac6cec'    # Purple for regular version
BACKGROUND_COLOR = '#ffffff'  # White background

def create_single_experiment_visualization(data, output_dir, experiment_name):
    """Create visualizations for a single experiment"""
    # Set style parameters
    plt.rcParams.update({
        'font.family': 'Arial',
        'font.weight': 'medium',
        'axes.labelweight': 'medium',
        'axes.titleweight': 'bold',
        'axes.titlesize': 18,  # Increased from 14
        'axes.labelsize': 16,  # Increased from 12
        'xtick.labelsize': 14,  # Increased from 10
        'ytick.labelsize': 14,  # Increased from 10
        'axes.grid': True,
        'grid.alpha': 0.3,
        'legend.fontsize': 14,  # Added legend font size
        'legend.title_fontsize': 16  # Added legend title font size
    })

    # Create figure with 2x2 subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(20, 15), facecolor=BACKGROUND_COLOR)
    
    # 1. Time Comparison
    times = [data['optimized']['total_duration'], data['regular']['total_duration']]
    ax1.bar(['Optimized', 'Regular'], times, color=[OPTIMIZED_COLOR, REGULAR_COLOR])
    ax1.set_title('Execution Time Comparison', pad=20)  # Added padding
    ax1.set_ylabel('Time (seconds)')
    
    # 2. Steps and API Calls
    metrics = {
        'Steps': [data['optimized']['steps_taken'], data['regular']['steps_taken']],
        'API Calls': [data['optimized']['api_calls'], data['regular']['api_calls']]
    }
    x = np.arange(len(metrics))
    width = 0.35
    
    optimized_values = [metrics[k][0] for k in metrics.keys()]
    regular_values = [metrics[k][1] for k in metrics.keys()]
    
    ax2.bar(x - width/2, optimized_values, width, label='Optimized', color=OPTIMIZED_COLOR)
    ax2.bar(x + width/2, regular_values, width, label='Regular', color=REGULAR_COLOR)
    ax2.set_xticks(x)
    ax2.set_xticklabels(list(metrics.keys()))
    ax2.set_title('Steps and API Calls', pad=20)  # Added padding
    ax2.legend(prop={'size': 14})  # Increased legend size
    
    # 3. Token Usage
    tokens = [data['optimized']['total_tokens']['total'], data['regular']['total_tokens']['total']]
    ax3.bar(['Optimized', 'Regular'], tokens, color=[OPTIMIZED_COLOR, REGULAR_COLOR])
    ax3.set_title('Token Usage', pad=20)  # Added padding
    ax3.set_ylabel('Number of Tokens')
    ax3.ticklabel_format(style='sci', axis='y', scilimits=(0,0))
    
    # 4. Errors
    errors = [len(data['optimized']['errors']), len(data['regular']['errors'])]
    ax4.bar(['Optimized', 'Regular'], errors, color=[OPTIMIZED_COLOR, REGULAR_COLOR])
    ax4.set_title('Error Count', pad=20)  # Added padding
    ax4.set_ylabel('Number of Errors')
    
    plt.suptitle(f'Performance Metrics - {experiment_name}', y=1.02, size=20)  # Increased from 16
    plt.tight_layout()
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f'{experiment_name}_metrics.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor=BACKGROUND_COLOR)
    plt.close()
    
    # Generate summary text with larger font size
    summary = f"""
    Performance Summary for {experiment_name}:
    
    Time Comparison:
    - Optimized: {data['optimized']['total_duration']:.2f} seconds
    - Regular: {data['regular']['total_duration']:.2f} seconds
    - Improvement: {((data['regular']['total_duration'] - data['optimized']['total_duration']) / data['regular']['total_duration'] * 100):.1f}%
    
    Steps and API Calls:
    - Steps (Optimized/Regular): {data['optimized']['steps_taken']}/{data['regular']['steps_taken']}
    - API Calls (Optimized/Regular): {data['optimized']['api_calls']}/{data['regular']['api_calls']}
    
    Token Usage:
    - Optimized: {data['optimized']['total_tokens']['total']:,} tokens
    - Regular: {data['regular']['total_tokens']['total']:,} tokens
    - Reduction: {data['regular']['total_tokens']['total'] - data['optimized']['total_tokens']['total']:,} tokens
    
    Errors:
    - Optimized: {len(data['optimized']['errors'])} errors
    - Regular: {len(data['regular']['errors'])} errors
    - Reduction: {len(data['regular']['errors']) - len(data['optimized']['errors'])} errors
    """
    
    with open(os.path.join(output_dir, f'{experiment_name}_summary.txt'), 'w') as f:
        f.write(summary)

def create_aggregate_visualization(all_experiments_data, output_dir):
    """Create aggregate visualizations across all experiments"""
    # Set style parameters for aggregate visualization
    plt.rcParams.update({
        'font.family': 'Arial',
        'font.weight': 'medium',
        'axes.labelweight': 'medium',
        'axes.titleweight': 'bold',
        'axes.titlesize': 18,  # Increased from 14
        'axes.labelsize': 16,  # Increased from 12
        'xtick.labelsize': 14,  # Increased from 10
        'ytick.labelsize': 14,  # Increased from 10
        'axes.grid': True,
        'grid.alpha': 0.3,
        'legend.fontsize': 14,  # Added legend font size
        'legend.title_fontsize': 16  # Added legend title font size
    })
    
    # Calculate averages
    metrics = {
        'Time': {'optimized': [], 'regular': []},
        'Steps': {'optimized': [], 'regular': []},
        'API Calls': {'optimized': [], 'regular': []},
        'Tokens': {'optimized': [], 'regular': []},
        'Errors': {'optimized': [], 'regular': []}
    }
    
    for exp in all_experiments_data:
        # Convert values to float to ensure type consistency
        metrics['Time']['optimized'].append(float(exp['optimized']['total_duration']))
        metrics['Time']['regular'].append(float(exp['regular']['total_duration']))
        metrics['Steps']['optimized'].append(float(exp['optimized']['steps_taken']))
        metrics['Steps']['regular'].append(float(exp['regular']['steps_taken']))
        metrics['API Calls']['optimized'].append(float(exp['optimized']['api_calls']))
        metrics['API Calls']['regular'].append(float(exp['regular']['api_calls']))
        metrics['Tokens']['optimized'].append(float(exp['optimized']['total_tokens']['total']))
        metrics['Tokens']['regular'].append(float(exp['regular']['total_tokens']['total']))
        metrics['Errors']['optimized'].append(float(len(exp['optimized']['errors'])))
        metrics['Errors']['regular'].append(float(len(exp['regular']['errors'])))
    
    # Calculate averages
    averages = {
        metric: {
            'optimized': float(np.mean(values['optimized'])),
            'regular': float(np.mean(values['regular']))
        }
        for metric, values in metrics.items()
    }
    
    # Create aggregate visualization
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(20, 15), facecolor=BACKGROUND_COLOR)
    
    # 1. Time Comparison
    times = [averages['Time']['optimized'], averages['Time']['regular']]
    ax1.bar(['Optimized', 'Regular'], times, color=[OPTIMIZED_COLOR, REGULAR_COLOR])
    ax1.set_title('Average Execution Time Comparison', pad=20)  # Added padding
    ax1.set_ylabel('Time (seconds)')
    
    # 2. Steps and API Calls
    metrics_plot = {
        'Steps': [averages['Steps']['optimized'], averages['Steps']['regular']],
        'API Calls': [averages['API Calls']['optimized'], averages['API Calls']['regular']]
    }
    x = np.arange(len(metrics_plot))
    width = 0.35
    
    optimized_values = [metrics_plot[k][0] for k in metrics_plot.keys()]
    regular_values = [metrics_plot[k][1] for k in metrics_plot.keys()]
    
    ax2.bar(x - width/2, optimized_values, width, label='Optimized', color=OPTIMIZED_COLOR)
    ax2.bar(x + width/2, regular_values, width, label='Regular', color=REGULAR_COLOR)
    ax2.set_xticks(x)
    ax2.set_xticklabels(list(metrics_plot.keys()))
    ax2.set_title('Average Steps and API Calls', pad=20)  # Added padding
    ax2.legend(prop={'size': 14})  # Increased legend size
    
    # 3. Token Usage
    tokens = [averages['Tokens']['optimized'], averages['Tokens']['regular']]
    ax3.bar(['Optimized', 'Regular'], tokens, color=[OPTIMIZED_COLOR, REGULAR_COLOR])
    ax3.set_title('Average Token Usage', pad=20)  # Added padding
    ax3.set_ylabel('Number of Tokens')
    ax3.ticklabel_format(style='sci', axis='y', scilimits=(0,0))
    
    # 4. Errors
    errors = [averages['Errors']['optimized'], averages['Errors']['regular']]
    ax4.bar(['Optimized', 'Regular'], errors, color=[OPTIMIZED_COLOR, REGULAR_COLOR])
    ax4.set_title('Average Error Count', pad=20)  # Added padding
    ax4.set_ylabel('Number of Errors')
    
    plt.suptitle('Aggregate Performance Metrics Across All Experiments', y=1.02, size=20)  # Increased from 16
    plt.tight_layout()
    
    # Save aggregate visualization
    output_path = os.path.join(output_dir, 'aggregate_metrics.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor=BACKGROUND_COLOR)
    plt.close()
    
    # Generate aggregate summary text
    summary = f"""
    Aggregate Performance Summary Across All Experiments:
    
    Average Time Comparison:
    - Optimized: {averages['Time']['optimized']:.2f} seconds
    - Regular: {averages['Time']['regular']:.2f} seconds
    - Average Improvement: {((averages['Time']['regular'] - averages['Time']['optimized']) / averages['Time']['regular'] * 100):.1f}%
    
    Average Steps and API Calls:
    - Steps (Optimized/Regular): {averages['Steps']['optimized']:.1f}/{averages['Steps']['regular']:.1f}
    - API Calls (Optimized/Regular): {averages['API Calls']['optimized']:.1f}/{averages['API Calls']['regular']:.1f}
    
    Average Token Usage:
    - Optimized: {averages['Tokens']['optimized']:,.0f} tokens
    - Regular: {averages['Tokens']['regular']:,.0f} tokens
    - Average Reduction: {averages['Tokens']['regular'] - averages['Tokens']['optimized']:,.0f} tokens
    
    Average Errors:
    - Optimized: {averages['Errors']['optimized']:.1f} errors
    - Regular: {averages['Errors']['regular']:.1f} errors
    - Average Reduction: {averages['Errors']['regular'] - averages['Errors']['optimized']:.1f} errors
    """
    
    with open(os.path.join(output_dir, 'aggregate_summary.txt'), 'w') as f:
        f.write(summary)

def process_all_experiments(base_path):
    """Process all comparison files in all subdirectories"""
    # Find all subdirectories
    subdirs = [d for d in os.listdir(base_path) 
              if os.path.isdir(os.path.join(base_path, d))]
    
    all_experiments_data = []
    
    for subdir in subdirs:
        subdir_path = os.path.join(base_path, subdir)
        # Find all files starting with "comparison"
        comparison_files = glob.glob(os.path.join(subdir_path, "comparison*.json"))
        
        for file_path in comparison_files:
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    # Store experiment data for aggregate analysis
                    data['experiment_name'] = os.path.splitext(os.path.basename(file_path))[0]
                    data['experiment_type'] = subdir
                    all_experiments_data.append(data)
                    
                    # Create individual visualization in the experiment's directory
                    create_single_experiment_visualization(data, subdir_path, data['experiment_name'])
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")
                continue
    
    if all_experiments_data:  # Only create aggregate visualization if we have data
        # Create aggregate visualizations in the base directory
        create_aggregate_visualization(all_experiments_data, base_path)
    
    return all_experiments_data

def main():
    base_path = '/Users/joy.wang/Projects/genai-genesis/aartisan/experiment'
    
    # Process all experiments and get aggregate data
    process_all_experiments(base_path)

if __name__ == "__main__":
    main()
